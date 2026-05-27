const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { pool } = require('./db');
require('dotenv').config();

async function initDb() {
    console.log('Initializing database setup...');

    // 1. Connect to default 'postgres' database to ensure the target database exists (Only if DB is local)
    const dbUrl = process.env.DATABASE_URL;
    const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('::1');
    
    if (isLocalDb) {
        const defaultDbUrl = dbUrl.replace(/\/([^/]+)$/, '/postgres');
        console.log(`Connecting to local default database to verify target database existence...`);
        const sysClient = new Client({ connectionString: defaultDbUrl });
        try {
            await sysClient.connect();
            const dbName = dbUrl.match(/\/([^/]+)$/)[1];
            
            const checkDb = await sysClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
            if (checkDb.rows.length === 0) {
                console.log(`Database "${dbName}" does not exist. Creating it now...`);
                await sysClient.query(`CREATE DATABASE "${dbName}"`);
                console.log(`Database "${dbName}" created successfully.`);
            } else {
                console.log(`Database "${dbName}" already exists.`);
            }
        } catch (err) {
            console.error('Error connecting to default PostgreSQL database. Please make sure PostgreSQL is running on port 5432 and the credentials in .env are correct.', err);
            process.exit(1);
        } finally {
            await sysClient.end();
        }
    } else {
        console.log('Remote/Cloud database detected. Skipping database auto-creation step and connecting directly.');
    }

    // 2. Connect to the actual target database to run schema and seed data
    console.log('Connecting to target database to run migrations...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('Schema created successfully.');

        // Hash and insert Admin User
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@bmhperumbavoor.com';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);
        await client.query(
            'INSERT INTO admin_users (username, email, password_hash) VALUES ($1, $2, $3)',
            [adminUsername, adminEmail, passwordHash]
        );
        console.log(`Admin user "${adminUsername}" created with email "${adminEmail}".`);

        // Seed Homepage Config
        const aboutFeatures = JSON.stringify([
            { text: '15 Advanced Operation Theatres' },
            { text: 'AI-Powered Advanced Flat Panel Cath Labs' },
            { text: 'Advanced Oncology Infrastructure with LINAC & Brachytherapy' },
            { text: 'Advanced Surgical Robot' },
            { text: 'Comprehensive Diagnostic Services including Digital PET-CT, SPECT-CT, 3T MRI, 256-slice CT, Digital Mammography, Ultrasound, and Digital X-ray' },
            { text: 'Integrated Laboratory & Blood Bank Services' }
        ]);

        const aboutStats = JSON.stringify([
            { icon: 'excellence.png', target: 39, suffix: '+', label: 'years of clinical excellence' },
            { icon: 'patients.png', target: 2, suffix: '+', label: 'Million Patients Cared Every Year' },
            { icon: 'bed.svg', target: 490, suffix: '', label: 'Bedded Facility' },
            { icon: 'specialities.png', target: 50, suffix: '+', label: 'Specialties' }
        ]);

        const careersBenefits = JSON.stringify([
            { icon_class: 'fa-solid fa-hospital-user', label: 'Facilities', value: 'Advanced Infrastructure' },
            { icon_class: 'fa-solid fa-graduation-cap', label: 'Development', value: 'Continuous Growth' },
            { icon_class: 'fa-solid fa-heart-pulse', label: 'Culture', value: 'Caring Environment' }
        ]);

        await client.query(`
            INSERT INTO homepage_config (
                about_badge, about_title, about_image, about_lead, about_paragraph1, about_paragraph2,
                about_collapsible_p1, about_collapsible_p2, about_collapsible_p3,
                about_features, about_stats, careers_benefits
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
            'overview',
            'About<br><span class="text-primary">BMH Perumbavoor</span>',
            'assets/images/4.jpeg',
            'A new destination for advanced healthcare is coming to Central Kerala.',
            'Baby Memorial Hospital Perumbavoor, the upcoming multi-specialty tertiary care hospital from the trusted BMH Group, is being envisioned to bring world-class clinical expertise, advanced technology, and compassionate care closer to the people of Perumbavoor and the surrounding regions.',
            'The hospital is being developed as one of the region’s most comprehensive healthcare destinations—designed to deliver integrated, patient-centred care across a wide spectrum of specialties.',
            'With a planned capacity of 490 beds, including 140+ ICU beds, advanced emergency facilities, dedicated day-care services, and dialysis units, BMH Perumbavoor will be equipped to manage everything from routine medical care to highly complex tertiary and critical care interventions.',
            'BMH Perumbavoor is envisioned to offer multidisciplinary expertise across cardiology, oncology, neurosciences, nephrology, orthopaedics, gastroenterology, women’s health, fertility care, emergency medicine, and critical care.',
            'Specialized facilities including IVF Lab, Endoscopy & ERCP suites, Neuro Lab, Urodynamic Lab, Cosmetic Laser services, Audiometry, and advanced cardiac diagnostics will further strengthen its commitment to comprehensive healthcare under one roof.',
            aboutFeatures,
            aboutStats,
            careersBenefits
        ]);
        console.log('Homepage config seeded.');

        // Seed Hero Slides
        const heroSlides = [
            ['World-Class Healthcare<br>with Compassion', 'Dedicated to providing exceptional patient-centered care through ultra-modern facilities and renowned medical experts.', 'assets/images/banner/hospital-medical-surgery-team-is-ready-for-the-ope-2026-03-24-07-42-35-utc.jpg.jpeg', 1],
            ['State-of-the-Art Medical<br>Technology & Robotics', 'Equipped with hybrid operation theatres, advanced diagnostics, and robotic surgery suites for faster recovery.', 'assets/images/banner/surgical-team-in-operating-room-looks-down-2026-03-10-02-12-44-utc.jpg.jpeg', 2],
            ['Every Second Counts.<br>Every Life Matters.', 'Our level-1 trauma team, advanced ICU beds, and rapid cardiac dispatch are prepared to rescue lives 24/7.', 'assets/images/banner/doctors-preparing-for-surgery-in-bright-operating-2026-03-25-23-38-10-utc.JPG.jpeg', 3]
        ];
        for (const slide of heroSlides) {
            await client.query(
                'INSERT INTO hero_slides (title, subtitle, image_url, sort_order) VALUES ($1, $2, $3, $4)',
                slide
            );
        }
        console.log('Hero slides seeded.');

        // Seed Facilities
        const facilities = [
            ['LINAC', 'Advanced radiotherapy system for precise cancer treatment.', 'assets/images/Facilities/LINAC.png', 1],
            ['BRACHY', 'Targeted radiation therapy for various localized cancers.', 'assets/images/Facilities/Brachy Therapy.png', 2],
            ['PET CT', 'High-precision imaging for comprehensive cancer staging.', 'assets/images/Facilities/PET CT.png', 3],
            ['SPECT CT', 'Advanced nuclear medicine imaging for accurate diagnosis.', 'assets/images/Facilities/SPECT CT.png', 4],
            ['Cath Lab', 'State-of-the-art flat panel lab for cardiac interventions.', 'assets/images/Facilities/Cath Lab.png', 5],
            ['Robotic Surgery', 'Minimally invasive procedures with robotic precision.', 'assets/images/Facilities/Robotic Surgery.png', 6],
            ['MRI Scan', 'High-resolution 3T MRI for detailed anatomical imaging.', 'assets/images/Facilities/MRI.png', 7],
            ['Mammography', 'Advanced digital mammography for early detection.', 'assets/images/Facilities/Mammogram.png', 8]
        ];
        for (const fac of facilities) {
            await client.query(
                'INSERT INTO facilities (title, description, image_url, sort_order) VALUES ($1, $2, $3, $4)',
                fac
            );
        }
        console.log('Facilities seeded.');

        // Seed Specialties
        const specialties = [
            ['Cardiology', 'Comprehensive cardiac care including preventive cardiology, diagnosis, and advanced treatment procedures.', 'assets/images/Specialities/Cardiology.png', 1],
            ['Orthopaedics', 'Advanced orthopaedic care for bone, joint, spine, trauma, and sports injury management.', 'assets/images/Specialities/Orthopaedic and Arthroscopic Surgery.png', 2],
            ['Neurology', 'Specialized diagnostics and care for complex disorders affecting the brain and nervous system.', 'assets/images/Specialities/Neurology.png', 3],
            ['Neurosurgery', 'Micro-precision neurosurgical treatments and advanced care for complex brain disorders.', 'assets/images/Specialities/Neurosurgery.png', 4],
            ['Spine Surgery', 'Specialized clinical evaluations and advanced surgical interventions for complex spinal conditions.', 'assets/images/Specialities/Spine Surgery.png', 5],
            ['Urology', 'Advanced clinical diagnosis and therapeutic care for urinary tract and renal conditions.', 'assets/images/Specialities/Urology.png', 6]
        ];
        for (const spec of specialties) {
            await client.query(
                'INSERT INTO specialties (title, description, image_url, sort_order) VALUES ($1, $2, $3, $4)',
                spec
            );
        }
        console.log('Specialties seeded.');

        // Seed Gallery
        const galleryItems = [
            ['Premium Hospital Facade', 'infra', 'assets/images/gallery/1.png', 1],
            ['Main Reception & Lounge', 'rooms', 'assets/images/gallery/2.png', 2],
            ['Modular Operation Theatre', 'tech', 'assets/images/gallery/3.png', 3],
            ['Critical Care Unit', 'tech', 'assets/images/gallery/4.png', 4],
            ['Hospital Reception', 'rooms', 'assets/images/gallery/5.png', 5],
            ['Expert Medical Team', 'infra', 'assets/images/gallery/6.png', 6],
            ['Patient Care Ward', 'rooms', 'assets/images/gallery/7.png', 7],
            ['Advanced Diagnostics', 'tech', 'assets/images/gallery/8.png', 8],
            ['Modern Facility Exterior', 'infra', 'assets/images/gallery/9.png', 9],
            ['Sleek Hospital Corridor', 'rooms', 'assets/images/gallery/10.png', 10],
            ['High-Precision Cath Lab', 'tech', 'assets/images/gallery/11.png', 11],
            ['Emergency Triage Area', 'infra', 'assets/images/gallery/12.png', 12]
        ];
        for (const item of galleryItems) {
            await client.query(
                'INSERT INTO gallery (title, category, image_url, sort_order) VALUES ($1, $2, $3, $4)',
                item
            );
        }
        console.log('Gallery seeded.');

        // Seed Events
        const events = [
            ['Free Health & Wellness Camp', 'Over 500 local residents received free clinical consultations, blood tests, and vital checks at our community healing camp.', 'May 20, 2026', 'Medical Camps', 'assets/images/about_hospital.png', 1],
            ['Preventive Health Talk', 'Hosted interactive wellness talks led by physicians on preventive cardiac habits, dietary health, and lifestyle improvements.', 'May 28, 2026', 'Awareness Programs', 'assets/images/hero_lobby.png', 2],
            ['Advanced Laparoscopy Seminar', 'Hosts premier national surgeons sharing live-streamed minimally invasive surgical masterclasses in modular operation theatres.', 'June 05, 2026', 'Doctor Conferences', 'assets/images/hero_surgery.png', 3],
            ['Mega Blood Donation Drive', 'Partnered with regional community teams to gather critical blood supplies, ensuring emergency surgical readiness.', 'June 14, 2026', 'CSR Activities', 'assets/images/facility_scanner.png', 4]
        ];
        for (const ev of events) {
            await client.query(
                'INSERT INTO events (title, description, event_date, category, image_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
                ev
            );
        }
        console.log('Events seeded.');

        // Seed Attractions
        const attractions = [
            ['Munnar', '12 km from BMH', 'Wildlife & Nature', 'assets/images/Munnar.PNG', 1],
            ['Alapuzha', '28 km from BMH', 'Ecotourism', 'assets/images/Alapuzha.PNG', 2],
            ['Fort Kochi', '25 km from BMH', 'Scenic Reserve', 'assets/images/Fort Kochi .PNG', 3]
        ];
        for (const attr of attractions) {
            await client.query(
                'INSERT INTO attractions (title, distance, tag, image_url, sort_order) VALUES ($1, $2, $3, $4, $5)',
                attr
            );
        }
        console.log('Attractions seeded.');

        // Seed Reach Modes
        const reachModes = [
            ['Air', 'By Air', 'Cochin International Airport (COK)', 'Located just a short drive away. Readily active pre-paid taxi booths and direct airport feeder lines ensure speedy commutes.', '12 km • 20 Mins Drive', 1],
            ['Rail', 'By Rail', 'Aluva Railway Station', 'The nearest major railhead connecting all major Indian cities. Active auto stands and local cabs are stationed just outside the station.', '15 km • 25 Mins Drive', 2],
            ['Road', 'By Road', 'Perumbavoor KSRTC Stand', 'Sits right along the Main Central (MC) Road. Easily accessible via city buses, inter-district coaches, and private transport lines.', '1.5 km • 5 Mins Drive', 3],
            ['Metro', 'By Metro', 'Aluva Metro Station', 'Direct connection to the entire Kochi Metro corridor. Direct feeder services, app-cabs, and local shuttles run continuously to Perumbavoor.', '14.5 km • 22 Mins Drive', 4]
        ];
        for (const mode of reachModes) {
            await client.query(
                'INSERT INTO reach_modes (mode, title, subtitle, description, badge_info, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
                mode
            );
        }
        console.log('Reach modes seeded.');

        // Seed Job Positions
        const defaultPositions = [
            ['Medical Consultant / Specialist', 1],
            ['Resident Medical Officer (RMO)', 2],
            ['Registered Nurse (Staff Nurse)', 3],
            ['Nursing Supervisor / Lead', 4],
            ['Allied Health Professional / Lab Tech', 5],
            ['Administrative / Operations Executive', 6]
        ];
        for (const pos of defaultPositions) {
            await client.query(
                'INSERT INTO job_positions (title, sort_order) VALUES ($1, $2)',
                pos
            );
        }
        console.log('Job positions seeded.');

        await client.query('COMMIT');
        console.log('Database initialization & seeding complete.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

initDb();
