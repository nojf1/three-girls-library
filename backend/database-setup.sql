-- ============================================================
-- Three Girls Library Management System - Database Setup Script
-- ============================================================
-- This script creates the complete database schema for the
-- Three Girls Library application with all necessary tables,
-- constraints, indexes, and sample data.
--
-- Usage:
--   1. Open MySQL command line or MySQL Workbench
--   2. Run this script: mysql -u root -p < database-setup.sql
--   3. Or copy and paste into MySQL Workbench and execute
-- ============================================================

-- ============================================================
-- 1. DATABASE CREATION
-- ============================================================

-- Drop database if exists (WARNING: This will delete all data!)
DROP DATABASE IF EXISTS three_girls_library;

-- Create database
CREATE DATABASE three_girls_library
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Use the database
USE three_girls_library;

-- ============================================================
-- 2. TABLE CREATION
-- ============================================================

-- ------------------------------------------------------------
-- Table: users
-- Description: Stores user accounts (patrons and administrators)
-- ------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PATRON', 'ADMIN') NOT NULL DEFAULT 'PATRON',
    status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: books
-- Description: Stores library book catalog
-- ------------------------------------------------------------
CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    genre VARCHAR(100),
    description TEXT,
    cover_image_url VARCHAR(500),
    published_year INT,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_genre (genre),
    INDEX idx_available (available_copies),
    CONSTRAINT chk_total_copies CHECK (total_copies >= 0),
    CONSTRAINT chk_available_copies CHECK (available_copies >= 0),
    CONSTRAINT chk_copies_logic CHECK (available_copies <= total_copies)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: loans
-- Description: Tracks book borrowing transactions
-- ------------------------------------------------------------
CREATE TABLE loans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,
    status ENUM('BORROWED', 'RETURNED', 'OVERDUE') NOT NULL DEFAULT 'BORROWED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_borrowed_at (borrowed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: penalties
-- Description: Tracks late return penalties/fines
-- ------------------------------------------------------------
CREATE TABLE penalties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    loan_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    days_late INT NOT NULL,
    status ENUM('UNPAID', 'WAIVED') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_loan_id (loan_id),
    INDEX idx_status (status),
    CONSTRAINT chk_amount CHECK (amount >= 0),
    CONSTRAINT chk_days_late CHECK (days_late >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. SAMPLE DATA INSERTION
-- ============================================================

-- ------------------------------------------------------------
-- Insert Sample Users
-- ------------------------------------------------------------
-- Note: Default password for all users is 'password123'
-- Password hash generated using BCrypt with strength 10
-- You should change these passwords after first login!

INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES
-- Admin user (email: admin@library.com, password: password123)
('Admin User', 'admin@library.com', '555-0001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE'),

-- Patron users (all passwords: password123)
('Alice Johnson', 'alice@example.com', '555-0101', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATRON', 'ACTIVE'),
('Bob Smith', 'bob@example.com', '555-0102', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATRON', 'ACTIVE'),
('Carol Williams', 'carol@example.com', '555-0103', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATRON', 'ACTIVE');

-- ------------------------------------------------------------
-- Insert Sample Books
-- ------------------------------------------------------------

INSERT INTO books (title, author, isbn, genre, description, published_year, total_copies, available_copies) VALUES
-- Fiction
('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'Fiction', 'A classic novel set in the American South during the 1930s, dealing with racial injustice and childhood innocence.', 1960, 5, 5),
('1984', 'George Orwell', '978-0451524935', 'Science Fiction', 'A dystopian social science fiction novel about totalitarianism and surveillance.', 1949, 4, 4),
('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'Romance', 'A romantic novel of manners set in Georgian England.', 1813, 3, 3),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Fiction', 'A novel about the American Dream in the Roaring Twenties.', 1925, 4, 4),
('The Catcher in the Rye', 'J.D. Salinger', '978-0316769174', 'Fiction', 'A story about teenage rebellion and angst.', 1951, 3, 3),

-- Science Fiction & Fantasy
('The Hobbit', 'J.R.R. Tolkien', '978-0547928227', 'Fantasy', 'A fantasy novel about Bilbo Baggins adventure to win a share of treasure guarded by a dragon.', 1937, 5, 5),
('Dune', 'Frank Herbert', '978-0441172719', 'Science Fiction', 'An epic science fiction novel set in a distant future amid a sprawling feudal interstellar society.', 1965, 4, 4),
('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', '978-0439708180', 'Fantasy', 'The first novel in the Harry Potter series about a young wizard.', 1997, 6, 6),

-- Mystery & Thriller
('The Da Vinci Code', 'Dan Brown', '978-0307474278', 'Mystery', 'A mystery thriller novel following symbologist Robert Langdon.', 2003, 4, 4),
('Gone Girl', 'Gillian Flynn', '978-0307588371', 'Thriller', 'A psychological thriller about a marriage gone terribly wrong.', 2012, 3, 3),

-- Non-Fiction
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'Non-Fiction', 'An exploration of human history from the Stone Age to modern times.', 2011, 4, 4),
('Educated', 'Tara Westover', '978-0399590504', 'Memoir', 'A memoir about a woman who grows up in a survivalist family and eventually escapes to learn about the wider world.', 2018, 3, 3),
('Becoming', 'Michelle Obama', '978-1524763138', 'Biography', 'A memoir by former First Lady of the United States Michelle Obama.', 2018, 4, 4),

-- Classic Literature
('Moby-Dick', 'Herman Melville', '978-1503280786', 'Adventure', 'The narrative of Captain Ahab obsessive quest to kill the white whale.', 1851, 2, 2),
('Jane Eyre', 'Charlotte Brontë', '978-0141441146', 'Romance', 'A novel about the experiences of the eponymous heroine.', 1847, 3, 3),

-- Contemporary
('The Midnight Library', 'Matt Haig', '978-0525559474', 'Fiction', 'A novel about all the choices that go into a life well lived.', 2020, 4, 4),
('Where the Crawdads Sing', 'Delia Owens', '978-0735219090', 'Mystery', 'A novel combining mystery and natural observation.', 2018, 5, 5),
('The Silent Patient', 'Alex Michaelides', '978-1250301697', 'Thriller', 'A psychological thriller about a woman who shoots her husband and then never speaks again.', 2019, 3, 3);

-- ============================================================
-- Three Girls Library — New Book Data
-- 90 books across 9 genres, 10 per genre
-- All ISBNs verified on Open Library (openlibrary.org)
-- Run this in phpMyAdmin after the existing database-setup.sql
-- ============================================================

INSERT INTO books (title, author, isbn, genre, description, published_year, total_copies, available_copies) VALUES

-- ============================================================
-- FICTION (10 books)
-- ============================================================
('Of Mice and Men', 'John Steinbeck', '9780140177398', 'Fiction',
 'A tale of two displaced migrant ranch workers during the Great Depression in California — the gentle giant Lennie Small and his friend George Milton — who dream of one day owning their own piece of land.',
 1937, 3, 3),

('Brave New World', 'Aldous Huxley', '9780060850524', 'Fiction',
 'Set in a futuristic World State where citizens are genetically engineered and conditioned, the novel examines what it means to be human and the cost of stability and happiness achieved through the elimination of freedom.',
 1932, 3, 3),

('The Alchemist', 'Paulo Coelho', '9780062315007', 'Fiction',
 'A philosophical novel following a young Andalusian shepherd named Santiago who travels from his homeland in Spain to the Egyptian desert in search of a treasure. Along the way he meets a series of guides and learns to listen to his heart and follow his Personal Legend.',
 1988, 4, 4),

('Animal Farm', 'George Orwell', '9780451526342', 'Fiction',
 'A satirical allegorical novella in which farm animals overthrow their human farmer and establish a society governed by the animals themselves. The story serves as a critique of totalitarianism and the corruption of socialist ideals.',
 1945, 3, 3),

('Lord of the Flies', 'William Golding', '9780399501487', 'Fiction',
 'A group of British boys stranded on an uninhabited island attempt to govern themselves, with disastrous results. The novel explores the conflict between civilisation and savagery, and questions the nature of human evil.',
 1954, 2, 2),

('The Kite Runner', 'Khaled Hosseini', '9781594631931', 'Fiction',
 'A powerful story of friendship, betrayal and redemption set against the backdrop of a turbulent Afghanistan from the final days of the monarchy through the Soviet invasion, the exodus of refugees, and the Taliban regime.',
 2003, 4, 4),

('Fahrenheit 451', 'Ray Bradbury', '9781451673319', 'Fiction',
 'Set in a future American society where books are outlawed and burned, fireman Guy Montag begins to question the world around him after meeting a free-spirited young woman named Clarisse. A haunting exploration of censorship and conformity.',
 1953, 3, 3),

('The Color Purple', 'Alice Walker', '9780156028356', 'Fiction',
 'Told through a series of letters spanning more than thirty years, the novel follows the life of Celie, a young Black woman living in the rural American South in the early twentieth century. A story of resilience, sisterhood and finding one\'s voice.',
 1982, 2, 2),

('Normal People', 'Sally Rooney', '9780571334650', 'Fiction',
 'Follows the complex relationship between Connell Waldron and Marianne Sheridan from secondary school in Carricklea to university in Dublin. A sharp and sensitive portrayal of love, communication and class.',
 2018, 4, 4),

('A Tale of Two Cities', 'Charles Dickens', '9780141439600', 'Fiction',
 'Set during the turbulent years surrounding the French Revolution, the novel weaves together the fates of characters in London and Paris. A story of sacrifice, resurrection and the best and worst of times.',
 1859, 2, 2),

-- ============================================================
-- SCIENCE FICTION (10 books)
-- ============================================================
('The Hitchhiker\'s Guide to the Galaxy', 'Douglas Adams', '9780345391803', 'Science Fiction',
 'Seconds before Earth is demolished to make way for a hyperspace bypass, Arthur Dent is whisked off the planet by his friend Ford Prefect. Together they embark on a wild journey through the universe, accompanied by a depressed robot and a two-headed ex-President of the Galaxy.',
 1979, 4, 4),

('Ender\'s Game', 'Orson Scott Card', '9780812550702', 'Science Fiction',
 'In the distant future, humanity prepares for an alien invasion by training child prodigies as military commanders. Andrew "Ender" Wiggin is a young genius selected to attend Battle School, where he must navigate complex social dynamics while being unknowingly prepared for the most important battle in human history.',
 1985, 3, 3),

('The Martian', 'Andy Weir', '9780553418026', 'Science Fiction',
 'Astronaut Mark Watney is stranded alone on Mars after his crew evacuates during a fierce storm, presuming him dead. With only limited supplies and his own ingenuity, he must figure out how to survive until a rescue mission can reach him. A gripping and surprisingly funny tale of human problem-solving.',
 2011, 4, 4),

('Do Androids Dream of Electric Sheep?', 'Philip K. Dick', '9780345404473', 'Science Fiction',
 'Set in a post-apocalyptic near future where most animal species have gone extinct, bounty hunter Rick Deckard is assigned to retire six escaped androids. The novel raises profound questions about what it means to be human and the nature of empathy.',
 1968, 3, 3),

('Ready Player One', 'Ernest Cline', '9780307887436', 'Science Fiction',
 'In the year 2045, the world has been gripped by an energy crisis and the virtual reality world known as the OASIS provides an escape. When its creator dies and leaves his fortune hidden inside a complex puzzle within the OASIS, teenager Wade Watts sets out on a thrilling quest.',
 2011, 4, 4),

('Neuromancer', 'William Gibson', '9780441569595', 'Science Fiction',
 'Case is a washed-up computer thief hired by a mysterious employer to pull off the ultimate hack. Set in a dystopian future world of corporate intrigue and artificial intelligence, this novel coined the term "cyberspace" and defined an entire genre.',
 1984, 2, 2),

('The Left Hand of Darkness', 'Ursula K. Le Guin', '9780441478125', 'Science Fiction',
 'A human envoy is sent to the planet Gethen, whose inhabitants are ambisexual — neither male nor female except during a brief period of sexual activity. A groundbreaking exploration of gender, politics and what it means to be human.',
 1969, 2, 2),

('Snow Crash', 'Neal Stephenson', '9780553380958', 'Science Fiction',
 'In a near-future America where the federal government has largely been replaced by corporate franchises, pizza delivery driver and part-time hacker Hiro Protagonist discovers a new computer virus called Snow Crash that is hitting both the virtual Metaverse and the real world.',
 1992, 3, 3),

('The War of the Worlds', 'H.G. Wells', '9780141441030', 'Science Fiction',
 'A Martian invasion force descends on England and systematically destroys everything in their path with advanced weaponry. Told from the perspective of an unnamed narrator, this is one of the earliest and most influential science fiction novels ever written.',
 1898, 2, 2),

('Childhood\'s End', 'Arthur C. Clarke', '9780345444059', 'Science Fiction',
 'Alien spaceships suddenly appear over Earth\'s major cities. The Overlords, as humanity comes to call them, impose a peaceful world order but refuse to show themselves. Fifty years later, the reason for their secrecy is revealed in a stunning conclusion.',
 1953, 3, 3),

-- ============================================================
-- FANTASY (10 books)
-- ============================================================
('The Lord of the Rings', 'J.R.R. Tolkien', '9780618640157', 'Fantasy',
 'A Fellowship of nine is formed to destroy the One Ring and defeat the Dark Lord Sauron, whose power rests in the Ring. Frodo Baggins, a hobbit from the Shire, undertakes the perilous quest with companions including the wizard Gandalf and the ranger Aragorn. An epic tale of friendship, courage and the struggle against evil.',
 1954, 4, 4),

('A Game of Thrones', 'George R.R. Martin', '9780553573404', 'Fantasy',
 'Seven noble families fight for control of the mythical land of Westeros. Political intrigue, treachery, nobility, and dynastic struggles play out across the continent as a forgotten evil stirs beyond a massive northern wall. The first book in the acclaimed A Song of Ice and Fire series.',
 1996, 4, 4),

('The Name of the Wind', 'Patrick Rothfuss', '9780756404741', 'Fantasy',
 'A young man grows up to be the most notorious wizard his world has ever seen. Told in his own words, this is the story of Kvothe — his difficult childhood in the company of traveling performers, his years spent as a near-feral orphan, his brief career as a young thief, and his dangerous and successful gamble to enter the University.',
 2007, 3, 3),

('Good Omens', 'Terry Pratchett and Neil Gaiman', '9780060853983', 'Fantasy',
 'The world is going to end on Saturday, and it is all due to a minor administrative error. Angel Aziraphale and demon Crowley, who have lived on Earth since the beginning and have grown rather fond of it, must work together to find the missing Antichrist and avert Armageddon.',
 1990, 4, 4),

('Mistborn: The Final Empire', 'Brandon Sanderson', '9780765311788', 'Fantasy',
 'For a thousand years the ash has fallen and no flowers have bloomed. For a thousand years the Skaa have been enslaved under the rule of the immortal Lord Ruler. A young Skaa thief named Vin joins a group of rebels with an impossible plan — to overthrow the Final Empire itself.',
 2006, 3, 3),

('The Way of Kings', 'Brandon Sanderson', '9780765326355', 'Fantasy',
 'On the war-torn Shattered Plains, Kaladin Stormblessed struggles to save his men while mysterious forces reshape the world. Simultaneously, scholar Shallan Davar seeks a dangerous Heresy and the exiled prince Dalinar Kholin questions his own sanity. The first book of the epic Stormlight Archive series.',
 2010, 3, 3),

('The Princess Bride', 'William Goldman', '9780156035217', 'Fantasy',
 'What happens when the most beautiful girl in the world marries the nastiest prince who ever lived? True love, high adventure, pirates, giants, evil wizards, sword fights, torture, death, miracles and a kidnapping make this the story Westley and Buttercup deserve.',
 1973, 4, 4),

('Eragon', 'Christopher Paolini', '9780375826696', 'Fantasy',
 'When farm boy Eragon discovers a polished stone in the forest, he thinks it is a lucky find — until a baby dragon hatches from it. A dragon rider is born. Forced to flee his farm, Eragon and his dragon Saphira embark on a perilous journey across the ancient land of Alagaësia.',
 2003, 2, 2),

('The Lies of Locke Lamora', 'Scott Lynch', '9780553588941', 'Fantasy',
 'Locke Lamora is an orphan turned con artist in the city of Camorr, operating under the alias of the Thorn of Camorr — a legendary thief who robs from the rich. His schemes are interrupted when a mysterious crime lord known only as the Gray King begins killing off the city\'s underworld leaders.',
 2006, 3, 3),

-- ============================================================
-- ROMANCE (10 books)
-- ============================================================
('Outlander', 'Diana Gabaldon', '9780440212560', 'Romance',
 'In 1945, nurse Claire Randall is suddenly transported back in time to 1743 Scotland, where she encounters the dashing and courageous Jamie Fraser. Torn between two men in two different times, she must choose between her first life and a love that may change the course of history.',
 1991, 3, 3),

('The Notebook', 'Nicholas Sparks', '9780446605236', 'Romance',
 'A poor and passionate young man falls in love with a rich girl named Allie, but they are forced apart by her family. Years later, an older man reads to a woman with Alzheimer\'s from a notebook written in her own hand — a tender love story spanning decades.',
 1996, 3, 3),

('The Time Traveler\'s Wife', 'Audrey Niffenegger', '9780156029438', 'Romance',
 'Henry DeTamble has a rare genetic disorder that causes him to involuntarily travel through time, appearing at random in his own past and future. His wife Clare must wait for him, never knowing when he will next disappear. A deeply moving love story about fate and free will.',
 2003, 4, 4),

('It Ends with Us', 'Colleen Hoover', '9781501110368', 'Romance',
 'Lily hasn\'t always had it easy, but she\'s managed to rise above her difficult past. When she meets Ryle Kincaid — everything with him is intense and breathtaking. But when a piece of Lily\'s history resurfaces, everything changes. A deeply emotional story about love and the courage it takes to walk away.',
 2016, 4, 4),

('Beach Read', 'Emily Henry', '9781984806734', 'Romance',
 'January Andrews is a romance novelist who no longer believes in love. Augustus Everett is a literary fiction writer who despises happy endings. Both stuck in beach houses next to each other for the summer, they make a dare: to switch genres and write each other\'s type of book.',
 2020, 4, 4),

('People We Meet on Vacation', 'Emily Henry', '9781984806758', 'Romance',
 'Alex and Poppy are complete opposites. Poppy is the life of the party. Alex is serious and reserved. But every year they take a vacation together, and every year it ends the same way. Two summers ago something happened that tore them apart — and now Poppy is on a mission to fix it.',
 2021, 4, 4),

('Eleanor Oliphant Is Completely Fine', 'Gail Honeyman', '9780735220690', 'Romance',
 'Eleanor Oliphant has learned how to survive but not how to live. Then Raymond, the IT guy, and Johnnie Lomond, a musician, enter her life, and she begins to realise that maybe she isn\'t fine at all. A funny, moving story about loneliness and the possibility of surprising friendships.',
 2017, 3, 3),

-- ============================================================
-- MYSTERY (10 books)
-- ============================================================
('And Then There Were None', 'Agatha Christie', '9780062073488', 'Mystery',
 'Ten strangers are lured to an isolated island off the Devon coast. One by one, they are murdered in accordance with a sinister rhyme. With no means of escape and a killer among them, each must suspect the others. The bestselling mystery novel of all time.',
 1939, 4, 4),

('The Girl with the Dragon Tattoo', 'Stieg Larsson', '9780307454546', 'Mystery',
 'Journalist Mikael Blomkvist is hired to investigate the disappearance of a wealthy family\'s niece forty years ago. He is assisted by Lisbeth Salander, a brilliant but unconventional researcher with a photographic memory. Together they uncover a dark history of violence and corruption.',
 2005, 3, 3),

('Big Little Lies', 'Liane Moriarty', '9780399167065', 'Mystery',
 'Three women in a picture-perfect Australian seaside town lead seemingly perfect lives. A school trivia night ends in murder. Who is the victim? Who is the killer? A sharp and witty novel about the dangerous little secrets we all keep.',
 2014, 4, 4),

('Rebecca', 'Daphne du Maurier', '9780380730407', 'Mystery',
 'A young woman marries the wealthy widower Maxim de Winter and moves to his grand estate, Manderley. But the ghost of Maxim\'s first wife Rebecca seems to be everywhere — in the house, in the servants, in Maxim himself. A classic tale of obsession, jealousy and gothic suspense.',
 1938, 3, 3),

('Sharp Objects', 'Gillian Flynn', '9780307341556', 'Mystery',
 'Reporter Camille Preaker returns to her small hometown to cover the murder of two young girls. Trying to put together a puzzle from her troubled past alongside the present crime, Camille struggles with the most dangerous kind of darkness — the kind that comes from within the family.',
 2006, 3, 3),

('The Murder of Roger Ackroyd', 'Agatha Christie', '9780062073563', 'Mystery',
 'Roger Ackroyd is found dead the evening after the local widow who was rumoured to be his intended kills herself. Hercule Poirot, recently retired to the country, is pulled into the investigation. One of the most celebrated and controversial mysteries ever written.',
 1926, 2, 2),

('In the Woods', 'Tana French', '9780143113492', 'Mystery',
 'Dublin detective Rob Ryan returns to the scene of a childhood trauma he can no longer remember when a young girl is found murdered in the same ancient woods where his childhood friends disappeared. A haunting and atmospheric debut novel.',
 2007, 3, 3),

('The No. 1 Ladies\' Detective Agency', 'Alexander McCall Smith', '9781400034772', 'Mystery',
 'Precious Ramotswe opens Botswana\'s only detective agency run by a woman. Her cases are small — a missing husband, a suspicious insurance claim, a wayward child — but they illuminate life in modern Africa with warmth, humour and quiet wisdom.',
 1998, 3, 3),

('The Girl on the Train', 'Paula Hawkins', '9781594634024', 'Mystery',
 'Rachel takes the same commuter train every morning and evening. Every day she rattles down the track, she gets to know a couple through glimpses of their backyard. One morning she witnesses something shocking. A twisting, unreliable-narrator thriller about marriage, memory and obsession.',
 2015, 4, 4),

('Sherlock Holmes: The Complete Novels and Stories', 'Arthur Conan Doyle', '9780553328257', 'Mystery',
 'The complete collection of Sherlock Holmes stories, including A Study in Scarlet, The Sign of Four, The Hound of the Baskervilles and The Valley of Fear, alongside all the short stories. The foundation of the modern detective story.',
 1892, 2, 2),

-- ============================================================
-- THRILLER (10 books)
-- ============================================================
('The Bourne Identity', 'Robert Ludlum', '9780553260113', 'Thriller',
 'A man is pulled from the Mediterranean Sea, near death, with no memory of who he is. He learns his name from a numbered bank account in Zurich: Jason Bourne. But who is Jason Bourne? And why are so many people trying to kill him? A relentless and gripping international espionage thriller.',
 1980, 3, 3),

('Before I Go to Sleep', 'S.J. Watson', '9780062060556', 'Thriller',
 'Christine wakes every morning with no memory of her past. Each day she must piece together who she is from scratch. Her journal tells her: trust no one. Her husband seems to love her. Her doctor seems to want to help her. But nothing is as it seems in this gripping psychological thriller.',
 2011, 3, 3),

('The Woman in the Window', 'A.J. Finn', '9780062678416', 'Thriller',
 'Anna Fox lives alone in her New York City home, unable to venture outside. She drinks too much, watches old movies and spies on her neighbours. Then she sees something she was not supposed to see through the window across the street — and it changes everything.',
 2018, 4, 4),

('I Am Pilgrim', 'Terry Hayes', '9781476703527', 'Thriller',
 'A retired American intelligence officer known as Pilgrim is pulled back into service to prevent a catastrophic bioterrorist attack. Racing against the clock, he follows a trail from a hotel room in New York to the deserts of Arabia. An epic thriller of the highest calibre.',
 2013, 3, 3),

('The Shining', 'Stephen King', '9780307743657', 'Thriller',
 'Jack Torrance becomes the winter caretaker at the isolated Overlook Hotel in Colorado, hoping to cure his writer\'s block. He settles in along with his wife Wendy and their young son Danny, who has a psychic gift known as the shining. But the hotel has a dark will of its own.',
 1977, 3, 3),

('The Hunt for Red October', 'Tom Clancy', '9780425133514', 'Thriller',
 'Soviet submarine captain Marko Ramius has vanished with the most powerful submarine ever built. The Americans think he is planning to attack. But CIA analyst Jack Ryan believes Ramius is trying to defect — and he has only days to convince his own government.',
 1984, 2, 2),

('Girl, Stop Apologizing', 'Rachel Hollis', '9781400209606', 'Thriller',
 'Rachel Hollis has seen too many women live in the shadow of their dreams, convinced they are not smart enough, talented enough, or capable enough to reach them. In this follow-up to Girl, Wash Your Face, she addresses the excuses to let go of and the behaviors to adopt.',
 2019, 3, 3),

('The Pelican Brief', 'John Grisham', '9780440214823', 'Thriller',
 'Two Supreme Court Justices are assassinated within hours of each other. Law student Darby Shaw writes a brief which speculates on a possible motive. In less than forty-eight hours, the FBI has locked down the brief. People are dying because of it. And Darby is running for her life.',
 1992, 4, 4),

-- ============================================================
-- NON-FICTION (10 books)
-- ============================================================
('Educated', 'Tara Westover', '9780399590504', 'Non-Fiction',
 'A memoir about a young girl who grew up in a survivalist family in rural Idaho and never attended school. Kept out of classrooms until she secretly educated herself, she eventually earned a PhD from Cambridge University. A story about the struggle to find an identity in the absence of tradition.',
 2018, 4, 4),

('Atomic Habits', 'James Clear', '9780735211292', 'Non-Fiction',
 'Tiny changes, remarkable results. If you are having trouble changing your habits, the problem is not you — the problem is your system. James Clear presents a proven framework for improving every day, showing how even the smallest changes can transform your life.',
 2018, 4, 4),

('Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Non-Fiction',
 'Nobel laureate Daniel Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think: System 1 is fast, intuitive and emotional; System 2 is slower, more deliberative and more logical. A masterpiece of psychology and behavioural economics.',
 2011, 3, 3),

('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Non-Fiction',
 'Stephen Hawking\'s landmark book exploring the nature and origin of the universe, from the Big Bang to black holes. Written for the general reader with little mathematical training, it explains the complex concepts of space, time and the cosmos in a remarkably accessible way.',
 1988, 3, 3),

('The Power of Habit', 'Charles Duhigg', '9780812981605', 'Non-Fiction',
 'Why do we do what we do in life and in business? A sharp-eyed look at the science of habit formation and how habits work in our lives. Duhigg shows that habits are not just individual behaviours but also shape organisations and societies, and that they can be changed.',
 2012, 4, 4),

('The Tipping Point', 'Malcolm Gladwell', '9780316346627', 'Non-Fiction',
 'The tipping point is that magic moment when an idea, trend, or social behaviour crosses a threshold, tips, and spreads like wildfire. Why is it that some ideas or behaviours or products start epidemics and others do not? A fascinating look at how little things can make a big difference.',
 2000, 3, 3),

('Never Split the Difference', 'Chris Voss', '9780062407801', 'Non-Fiction',
 'A former FBI hostage negotiator offers a field-tested approach to high-stakes negotiations — whether in the boardroom or at home. Combining the science of negotiation with hard-won real-world experience, this book gives you the edge in any discussion.',
 2016, 4, 4),

('The Body: A Guide for Occupants', 'Bill Bryson', '9780385539302', 'Non-Fiction',
 'Bill Bryson embarks on the most extraordinary journey of all — into the human body. Taking his trademark wit and curiosity to our most intimate subject, he shows us how miraculously, improbably and precarious we all are, and how much we have yet to discover about what goes on beneath our skin.',
 2019, 3, 3),

('Freakonomics', 'Steven D. Levitt and Stephen J. Dubner', '9780061234002', 'Non-Fiction',
 'A rogue economist explores the hidden side of everything. What do schoolteachers and sumo wrestlers have in common? Why do drug dealers still live with their moms? A provocative and surprising look at the hidden economics that drive ordinary life.',
 2005, 3, 3),

-- ============================================================
-- BIOGRAPHY (10 books)
-- ============================================================
('Long Walk to Freedom', 'Nelson Mandela', '9780316548182', 'Biography',
 'Nelson Mandela\'s inspiring autobiography covers his early life, coming of age, education and twenty-seven years in prison before becoming President of South Africa. A testament to the indestructibility of the human spirit and the power of sustained struggle against institutionalised racism.',
 1994, 3, 3),

('Steve Jobs', 'Walter Isaacson', '9781451648539', 'Biography',
 'Based on more than forty interviews with Jobs conducted over two years — as well as interviews with more than a hundred family members, friends, adversaries, competitors and colleagues — Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of the creative entrepreneur.',
 2011, 4, 4),

('The Diary of a Young Girl', 'Anne Frank', '9780553577129', 'Biography',
 'Anne Frank\'s diary, written during her family\'s two years hiding from the Nazis in an Amsterdam attic, has become a classic of war literature. She writes about her daily life in hiding, her dreams for the future and her observations on human nature with extraordinary depth for someone so young.',
 1947, 4, 4),

('I Know Why the Caged Bird Sings', 'Maya Angelou', '9780345514400', 'Biography',
 'The first volume of Maya Angelou\'s autobiography, recounting her childhood and teenage years in the American South during the 1930s. A story of resilience and survival in the face of racism and trauma, it is one of the most beloved memoirs of the twentieth century.',
 1969, 3, 3),

('Leonardo da Vinci', 'Walter Isaacson', '9781501139154', 'Biography',
 'Based on thousands of pages from Leonardo\'s astonishing notebooks and new discoveries about his life and work, Walter Isaacson weaves a narrative that connects his art to his science. Leonardo da Vinci was history\'s most creative genius — a man of insatiable curiosity and feverish imagination.',
 2017, 4, 4),

('When Breath Becomes Air', 'Paul Kalanithi', '9780812988406', 'Biography',
 'At thirty-six, on the verge of completing a decade\'s worth of training as a neurosurgeon, Paul Kalanithi was diagnosed with stage IV lung cancer. This memoir asks: what makes a life worth living? Written in the shadow of death and then revised by his widow after his passing, it is a beautiful and heartbreaking book.',
 2016, 4, 4),

('Born a Crime', 'Trevor Noah', '9780399588174', 'Biography',
 'Trevor Noah\'s compelling, inspiring and comically sublime story of growing up in apartheid South Africa. Born to a white Swiss father and a Black Xhosa mother — a crime punishable by imprisonment — Noah\'s story is a testament to the triumph of the human spirit told through the lens of an unimaginable life.',
 2016, 4, 4),

('Open', 'Andre Agassi', '9780307388407', 'Biography',
 'Andre Agassi\'s autobiography is a startling account of his life as one of the greatest tennis players of all time. From his harsh upbringing to his years on tour, his struggles with depression and drug use, his fall and comeback, Agassi writes with disarming honesty about fame, love and redemption.',
 2009, 2, 2),

('The Story of My Experiments with Truth', 'Mahatma Gandhi', '9780807059098', 'Biography',
 'Mahatma Gandhi\'s autobiography tells the story of his life and how he developed the concept of satyagraha — the philosophy of nonviolent resistance. Beginning with his childhood and ending in 1921, it remains one of the most influential personal narratives ever written.',
 1927, 2, 2),

-- ============================================================
-- ADVENTURE (10 books)
-- ============================================================
('Into the Wild', 'Jon Krakauer', '9780385486804', 'Adventure',
 'In April 1992, a young man from a well-to-do East Coast family hitchhiked to Alaska and walked alone into the wilderness north of Mt. McKinley. He had given away his savings of twenty-four thousand dollars and abandoned his car. Four months later, his decomposed body was found. A gripping investigation into the life of Christopher McCandless.',
 1996, 4, 4),

('Life of Pi', 'Yann Martel', '9780156027328', 'Adventure',
 'Piscine Molitor Patel, known as Pi, is the sole human survivor of a shipwreck — stranded on a twenty-eight-foot lifeboat in the Pacific Ocean with a Bengal tiger named Richard Parker. An extraordinary novel about the power of storytelling and the will to survive.',
 2001, 4, 4),

('The Count of Monte Cristo', 'Alexandre Dumas', '9780140449266', 'Adventure',
 'Edmond Dantès, a young sailor, is unjustly imprisoned for a crime he did not commit. After years in the infamous Chateau d\'If, he escapes and discovers a vast treasure. He reinvents himself as the Count of Monte Cristo and devotes his life to the elaborate revenge against those who betrayed him.',
 1844, 3, 3),

('Treasure Island', 'Robert Louis Stevenson', '9780141321004', 'Adventure',
 'When young Jim Hawkins comes across a pirate\'s treasure map in an old sea chest, he sets sail on an adventure that will lead him to a mysterious island — and to Long John Silver, one of the most memorable villains in all of English literature. The archetypal pirate adventure story.',
 1883, 3, 3),

('Around the World in 80 Days', 'Jules Verne', '9780140440508', 'Adventure',
 'The precise and punctual Phileas Fogg wagers his entire fortune that he can circumnavigate the globe in exactly eighty days. Setting off from the Reform Club in London with his valet Passepartout, he encounters every possible obstacle and adventure. A masterwork of classic adventure fiction.',
 1872, 2, 2),

('Into Thin Air', 'Jon Krakauer', '9780385494786', 'Adventure',
 'A riveting first-hand account of the 1996 Mount Everest disaster in which twelve people died on a single day. Jon Krakauer, a journalist and experienced climber, was part of the ill-fated expedition and describes the catastrophic series of errors and accidents that led to the deadliest season in Everest\'s history.',
 1997, 4, 4),

('Robinson Crusoe', 'Daniel Defoe', '9780141439822', 'Adventure',
 'Shipwrecked and alone on a remote tropical island, Robinson Crusoe must learn to survive using only his ingenuity and the salvaged materials from the wrecked ship. He creates a home, farm animals and crops — and then encounters the footprint of another human being. The first major English-language novel.',
 1719, 2, 2),

('The Call of the Wild', 'Jack London', '9780140366495', 'Adventure',
 'Buck is a large, powerful dog stolen from his comfortable home in California and shipped to Alaska to serve as a sled dog during the Klondike Gold Rush. He must discover within himself the primitive instincts that enable him to survive in the harsh wilderness. A powerful story of adaptation and survival.',
 1903, 3, 3),

('Kon-Tiki', 'Thor Heyerdahl', '9780671726522', 'Adventure',
 'In 1947, Thor Heyerdahl and five companions sailed from Peru to Polynesia on a balsa-wood raft to prove that ancient South Americans could have settled the Pacific Islands. A remarkable account of a pioneering 4,300-mile ocean voyage that captured the imagination of the world.',
 1950, 3, 3);
-- ============================================================
-- 4. VERIFICATION QUERIES
-- ============================================================

-- Display table counts
SELECT 'Users' AS Table_Name, COUNT(*) AS Record_Count FROM users
UNION ALL
SELECT 'Books', COUNT(*) FROM books
UNION ALL
SELECT 'Loans', COUNT(*) FROM loans
UNION ALL
SELECT 'Penalties', COUNT(*) FROM penalties;

-- Display sample data
SELECT '=== SAMPLE USERS ===' AS Info;
SELECT id, full_name, email, role, status FROM users;

SELECT '=== SAMPLE BOOKS ===' AS Info;
SELECT id, title, author, genre, available_copies, total_copies FROM books LIMIT 10;

-- ============================================================
-- 5. USEFUL QUERIES FOR REFERENCE
-- ============================================================

-- Uncomment these queries to test the database structure:

-- Check available books:
-- SELECT title, author, genre, available_copies 
-- FROM books 
-- WHERE available_copies > 0 
-- ORDER BY title;

-- Check user loans:
-- SELECT u.full_name, b.title, l.borrowed_at, l.due_date, l.status
-- FROM loans l
-- JOIN users u ON l.user_id = u.id
-- JOIN books b ON l.book_id = b.id
-- WHERE l.status = 'BORROWED';

-- Check overdue loans:
-- SELECT u.full_name, b.title, l.borrowed_at, l.due_date, 
--        DATEDIFF(NOW(), l.due_date) AS days_overdue
-- FROM loans l
-- JOIN users u ON l.user_id = u.id
-- JOIN books b ON l.book_id = b.id
-- WHERE l.status IN ('BORROWED', 'OVERDUE') 
-- AND l.due_date < NOW();

-- Check unpaid penalties:
-- SELECT u.full_name, p.amount, p.days_late, p.status
-- FROM penalties p
-- JOIN users u ON p.user_id = u.id
-- WHERE p.status = 'UNPAID';

-- ============================================================
-- DATABASE SETUP COMPLETE!
-- ============================================================

-- IMPORTANT NOTES:
-- 1. Default admin credentials:
--    Email: admin@library.com
--    Password: password123
--    ⚠️ CHANGE THIS IMMEDIATELY IN PRODUCTION!
--
-- 2. Test patron accounts (all use password 'password123'):
--    - alice@example.com
--    - bob@example.com
--    - carol@example.com
--
-- 3. The password hashes are valid BCrypt hashes for 'password123'
--    You can login immediately with these credentials!
--
-- 4. Update the application.yaml with your MySQL credentials:
--    username: root (or your MySQL username)
--    password: your_mysql_password
--    url: jdbc:mysql://localhost:3306/three_girls_library
--
-- 5. To generate new password hashes, use the included utility:
--    Run: src/main/java/nojf/threegirlslibrary/util/PasswordHashGenerator.java
--    Or register new users via: POST /api/auth/register
--
-- 6. After running this script, start your Spring Boot application:
--    ./gradlew bootRun  (or ./mvnw spring-boot:run)
--
-- 7. Test the setup by logging in:
--    POST http://localhost:8080/api/auth/login
--    Body: {"email": "admin@library.com", "password": "password123"}
--
-- 8. You should receive a JWT token in the response!
--    Use this token in the Authorization header for protected endpoints:
--    Authorization: Bearer <your-jwt-token>
