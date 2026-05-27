-- Database Schema for BMH Perumbavoor CMS

-- Drop tables if they exist
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS homepage_config CASCADE;
DROP TABLE IF EXISTS hero_slides CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS attractions CASCADE;
DROP TABLE IF EXISTS reach_modes CASCADE;
DROP TABLE IF EXISTS job_positions CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;

-- Admin Users Table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Homepage config (single row)
CREATE TABLE homepage_config (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    about_badge VARCHAR(50) DEFAULT 'overview',
    about_title TEXT DEFAULT 'About<br><span class="text-primary">BMH Perumbavoor</span>',
    about_image VARCHAR(255) DEFAULT 'assets/images/4.jpeg',
    about_lead TEXT DEFAULT 'A new destination for advanced healthcare is coming to Central Kerala.',
    about_paragraph1 TEXT DEFAULT 'Baby Memorial Hospital Perumbavoor, the upcoming multi-specialty tertiary care hospital from the trusted BMH Group, is being envisioned to bring world-class clinical expertise, advanced technology, and compassionate care closer to the people of Perumbavoor and the surrounding regions.',
    about_paragraph2 TEXT DEFAULT 'The hospital is being developed as one of the region’s most comprehensive healthcare destinations—designed to deliver integrated, patient-centred care across a wide spectrum of specialties.',
    about_collapsible_p1 TEXT DEFAULT 'With a planned capacity of 490 beds, including 140+ ICU beds, advanced emergency facilities, dedicated day-care services, and dialysis units, BMH Perumbavoor will be equipped to manage everything from routine medical care to highly complex tertiary and critical care interventions.',
    about_collapsible_p2 TEXT DEFAULT 'BMH Perumbavoor is envisioned to offer multidisciplinary expertise across cardiology, oncology, neurosciences, nephrology, orthopaedics, gastroenterology, women’s health, fertility care, emergency medicine, and critical care.',
    about_collapsible_p3 TEXT DEFAULT 'Specialized facilities including IVF Lab, Endoscopy & ERCP suites, Neuro Lab, Urodynamic Lab, Cosmetic Laser services, Audiometry, and advanced cardiac diagnostics will further strengthen its commitment to comprehensive healthcare under one roof.',
    about_features JSONB DEFAULT '[]'::jsonb,
    about_stats JSONB DEFAULT '[]'::jsonb,
    
    facilities_title VARCHAR(255) DEFAULT 'World-Class Facilities',
    facilities_subtitle TEXT DEFAULT 'BMH Perumbavoor is poised to be equipped with cutting-edge clinical infrastructure built to modern international standards, ensuring swift medical intervention and patient comfort.',
    
    specialties_title VARCHAR(255) DEFAULT 'Our Specialities',
    specialties_subtitle TEXT DEFAULT 'Specialized healthcare services across multiple medical disciplines supported by experienced consultants.',
    
    gallery_title VARCHAR(255) DEFAULT 'Our Premium Infrastructure',
    gallery_subtitle TEXT DEFAULT 'Explore the high-fidelity healing environments, ultra-modern ICU setups, high-precision operation theatres, and welcoming hospital spaces built to elevate patient comfort at BMH Perumbavoor.',
    
    events_title VARCHAR(255) DEFAULT 'Events & Activities',
    events_subtitle TEXT DEFAULT 'Stay connected with the latest health camps, medical breakthroughs, clinical seminars, and active community welfare events hosted by BMH Perumbavoor.',
    
    careers_title VARCHAR(255) DEFAULT 'Join Our Healing Team',
    careers_description TEXT DEFAULT 'Join our mission to deliver compassionate, advanced, and premium clinical excellence. We are constantly searching for talented medical professionals, physician specialists, and dedicated nursing teams to expand our services.',
    careers_benefits JSONB DEFAULT '[]'::jsonb,
    
    attractions_title VARCHAR(255) DEFAULT 'Nearby Attractions',
    attractions_subtitle TEXT DEFAULT 'Convenient points of interest, nature sanctuaries, and historical landmarks located in close proximity to the BMH campus.',
    
    reach_title VARCHAR(255) DEFAULT 'How to Reach BMH',
    reach_subtitle TEXT DEFAULT 'Conveniently situated in the heart of Perumbavoor, our medical campus is easily accessible through multiple transportation networks across Kerala.',
    
    footer_about TEXT DEFAULT 'BMH Perumbavoor is committed to delivering advanced, compassionate, and accessible healthcare services backed by experienced specialists and modern medical infrastructure.',
    footer_phone VARCHAR(50) DEFAULT '+91 XXXXX XXXXX',
    footer_email VARCHAR(100) DEFAULT 'info@bmhperumbavoor.com',
    footer_address TEXT DEFAULT 'BMH Perumbavoor Perumbavoor, Kerala',
    footer_facebook VARCHAR(255) DEFAULT 'https://www.facebook.com/bmhperumbavoor',
    footer_instagram VARCHAR(255) DEFAULT 'https://www.instagram.com/bmhperumbavoor/',
    footer_twitter VARCHAR(255) DEFAULT '#',
    footer_linkedin VARCHAR(255) DEFAULT '#'
);

-- Hero Slides
CREATE TABLE hero_slides (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Facilities
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Specialties
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Gallery
CREATE TABLE gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'infra', 'tech', 'rooms'
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date VARCHAR(50),
    category VARCHAR(100),
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Attractions
CREATE TABLE attractions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    distance VARCHAR(50),
    tag VARCHAR(100),
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Reach Modes
CREATE TABLE reach_modes (
    id SERIAL PRIMARY KEY,
    mode VARCHAR(50) NOT NULL, -- 'Air', 'Rail', 'Road', 'Metro'
    title VARCHAR(255),
    subtitle VARCHAR(255),
    description TEXT,
    badge_info VARCHAR(100),
    sort_order INT DEFAULT 0
);

-- Job Positions Table
CREATE TABLE job_positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

-- Job Applications Table
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NOT NULL,
    message TEXT,
    resume_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
