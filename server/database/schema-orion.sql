-- ORION expansion: skills taxonomy, portfolio, assessments, messaging,
-- notifications, community, university portal, referrals, gamification.
-- Run via migrate-orion.js (handles already-applied statements gracefully).

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('Programming Languages','Frameworks','Databases','Cloud','Cybersecurity','AI & Data','Tools & DevOps','Soft Skills') NOT NULL DEFAULT 'Programming Languages'
);

CREATE TABLE IF NOT EXISTS student_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    UNIQUE KEY uq_student_skill (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    repo_url VARCHAR(500),
    demo_url VARCHAR(500),
    tech_stack VARCHAR(500),
    source ENUM('manual','github') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    difficulty ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
    pass_mark INT DEFAULT 70,
    questions_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assessment_id INT NOT NULL,
    score INT NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_convo (sender_id, recipient_id),
    INDEX idx_recipient (recipient_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    content VARCHAR(500) NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type ENUM('career_fair','hackathon','meetup','workshop') NOT NULL DEFAULT 'meetup',
    description TEXT,
    location VARCHAR(200),
    is_virtual BOOLEAN DEFAULT FALSE,
    event_date DATETIME NOT NULL,
    url VARCHAR(500),
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (event_date)
);

CREATE TABLE IF NOT EXISTS qa_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS qa_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES qa_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- code is intentionally NOT unique: one persistent code per referrer, with one
-- row logged per successful referred signup (so a code can be reused by many friends).
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_user_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    referred_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code)
);

CREATE TABLE IF NOT EXISTS profile_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    viewer_user_id INT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id)
);

CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_badge (user_id, badge),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    proposed_time DATETIME NOT NULL,
    status ENUM('proposed','confirmed','declined','completed') DEFAULT 'proposed',
    meeting_link VARCHAR(500),
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    viewer_user_id INT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job (job_id)
);

CREATE TABLE IF NOT EXISTS universities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    university_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(150),
    website VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Column / enum expansions on existing tables
ALTER TABLE users MODIFY role ENUM('student','company','admin','university') NOT NULL DEFAULT 'student';
ALTER TABLE students ADD COLUMN headline VARCHAR(200) NULL;
ALTER TABLE students ADD COLUMN degree VARCHAR(150) NULL;
ALTER TABLE students ADD COLUMN city VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN github_username VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN portfolio_slug VARCHAR(120) NULL UNIQUE;
ALTER TABLE students ADD COLUMN career_path VARCHAR(100) NULL;
ALTER TABLE students ADD COLUMN availability ENUM('Immediately','Within 1 month','Within 3 months','After graduation') NULL;
ALTER TABLE students ADD COLUMN communication_self_score INT NULL;
ALTER TABLE students ADD COLUMN university_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE applications MODIFY status ENUM('pending','reviewed','shortlisted','interview','offer','rejected','accepted','hired') DEFAULT 'pending';
ALTER TABLE applications ADD COLUMN match_score INT NULL;
ALTER TABLE referrals DROP INDEX code;
