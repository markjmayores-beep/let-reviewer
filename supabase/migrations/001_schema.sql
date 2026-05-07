-- ============================================================
-- LET REVIEWER PLATFORM — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  exam_type TEXT CHECK (exam_type IN ('elementary', 'secondary')) DEFAULT 'elementary',
  major TEXT, -- for secondary: 'English', 'Math', etc.
  target_exam_date DATE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject TEXT NOT NULL,        -- 'Professional Education', 'General Education', etc.
  topic TEXT NOT NULL,           -- 'Educational Psychology', 'Algebra', etc.
  subtopic TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  question_text TEXT NOT NULL,
  choices JSONB NOT NULL,        -- [{"key":"A","text":"..."},{"key":"B","text":"..."}]
  correct_answer TEXT NOT NULL,  -- 'A', 'B', 'C', or 'D'
  explanation TEXT,
  image_url TEXT,
  tags TEXT[],
  exam_type TEXT CHECK (exam_type IN ('elementary', 'secondary', 'both')) DEFAULT 'both',
  is_active BOOLEAN DEFAULT TRUE,
  reported_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTION ATTEMPTS (tracks every answer)
-- ============================================================
CREATE TABLE attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_ms INTEGER, -- milliseconds to answer
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXAM SESSIONS
-- ============================================================
CREATE TABLE exam_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT CHECK (mode IN ('quick', 'timed', 'mock', 'survival', 'daily', 'mastery')) NOT NULL,
  subject TEXT,
  topic TEXT,
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  time_taken_ms INTEGER,
  question_ids UUID[],
  answers JSONB, -- {"question_id": "selected_answer"}
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================================
-- STREAKS
-- ============================================================
CREATE TABLE streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_study_days INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS (PayMongo)
-- ============================================================
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT CHECK (plan IN ('monthly', 'yearly')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'pending')) DEFAULT 'pending',
  paymongo_payment_id TEXT,
  paymongo_link_id TEXT,
  amount INTEGER NOT NULL, -- in centavos (₱199 = 19900)
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DAILY CHALLENGES
-- ============================================================
CREATE TABLE daily_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_date DATE UNIQUE NOT NULL,
  question_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_challenge_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_date DATE NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  percentage DECIMAL(5,2),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
);

-- ============================================================
-- LEADERBOARD (materialized view updated daily)
-- ============================================================
CREATE TABLE leaderboard_weekly (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2),
  streak INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  rank INTEGER,
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- REPORTED QUESTIONS
-- ============================================================
CREATE TABLE question_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  reason TEXT CHECK (reason IN ('wrong_answer', 'typo', 'outdated', 'unclear', 'other')) NOT NULL,
  details TEXT,
  status TEXT CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions: everyone can read active questions
CREATE POLICY "Anyone can read active questions" ON questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage questions" ON questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Attempts: users manage own attempts
CREATE POLICY "Users manage own attempts" ON attempts FOR ALL USING (auth.uid() = user_id);

-- Exam sessions: users manage own sessions
CREATE POLICY "Users manage own sessions" ON exam_sessions FOR ALL USING (auth.uid() = user_id);

-- Bookmarks: users manage own bookmarks
CREATE POLICY "Users manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Streaks: users manage own streaks
CREATE POLICY "Users manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: users view own subscriptions
CREATE POLICY "Users view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Daily challenges: everyone can read
CREATE POLICY "Anyone can read daily challenges" ON daily_challenges FOR SELECT USING (TRUE);
CREATE POLICY "Users manage own challenge entries" ON daily_challenge_entries FOR ALL USING (auth.uid() = user_id);

-- Leaderboard: everyone can read
CREATE POLICY "Anyone can read leaderboard" ON leaderboard_weekly FOR SELECT USING (TRUE);

-- Reports: users can insert, admins can manage
CREATE POLICY "Users can report questions" ON question_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage reports" ON question_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_exam_type ON questions(exam_type);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_question_id ON attempts(question_id);
CREATE INDEX idx_attempts_created_at ON attempts(created_at);
CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_mode ON exam_sessions(mode);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- ============================================================
-- SEED: SAMPLE QUESTIONS (Professional Education)
-- ============================================================
INSERT INTO questions (subject, topic, subtopic, difficulty, question_text, choices, correct_answer, explanation, exam_type) VALUES

('Professional Education', 'Educational Psychology', 'Cognitive Development', 'medium',
'According to Jean Piaget, during which stage of cognitive development does a child begin to think logically about concrete objects?',
'[{"key":"A","text":"Sensorimotor Stage"},{"key":"B","text":"Preoperational Stage"},{"key":"C","text":"Concrete Operational Stage"},{"key":"D","text":"Formal Operational Stage"}]',
'C',
'The Concrete Operational Stage (ages 7–11) is when children develop logical thinking about concrete objects. They can classify, seriate, and understand conservation, but still struggle with abstract thinking.',
'both'),

('Professional Education', 'Educational Psychology', 'Learning Theories', 'medium',
'Which learning theory emphasizes that learning occurs through observing and imitating others?',
'[{"key":"A","text":"Behaviorism"},{"key":"B","text":"Social Learning Theory"},{"key":"C","text":"Constructivism"},{"key":"D","text":"Cognitivism"}]',
'B',
'Albert Bandura''s Social Learning Theory (also called Social Cognitive Theory) proposes that people learn by observing others. His famous Bobo Doll experiment demonstrated that children imitate aggressive behaviors they observe.',
'both'),

('Professional Education', 'Curriculum Development', 'Curriculum Design', 'medium',
'Which curriculum design organizes content in increasing complexity, building on previously learned knowledge?',
'[{"key":"A","text":"Broad Fields Design"},{"key":"B","text":"Activity Design"},{"key":"C","text":"Spiral Curriculum"},{"key":"D","text":"Core Design"}]',
'C',
'The Spiral Curriculum, proposed by Jerome Bruner, organizes content so that concepts are introduced at simple levels and revisited in increasing complexity. It ensures that students can build on prior knowledge.',
'both'),

('Professional Education', 'Assessment', 'Types of Assessment', 'easy',
'A teacher gives a test at the beginning of the school year to determine students'' prior knowledge. This is an example of which type of assessment?',
'[{"key":"A","text":"Summative Assessment"},{"key":"B","text":"Formative Assessment"},{"key":"C","text":"Diagnostic Assessment"},{"key":"D","text":"Authentic Assessment"}]',
'C',
'Diagnostic Assessment is conducted before instruction to identify students'' prior knowledge, skills, and misconceptions. It helps teachers plan instruction appropriately.',
'both'),

('Professional Education', 'Teaching Strategies', 'Instructional Methods', 'medium',
'Which teaching strategy is most appropriate when the teacher wants students to discover concepts through guided inquiry?',
'[{"key":"A","text":"Direct Instruction"},{"key":"B","text":"Discovery Learning"},{"key":"C","text":"Lecture Method"},{"key":"D","text":"Rote Learning"}]',
'B',
'Discovery Learning (Bruner) involves students actively exploring and discovering concepts themselves with teacher guidance. It promotes deeper understanding and intrinsic motivation compared to passive reception.',
'both'),

('General Education', 'English', 'Grammar', 'easy',
'Which of the following sentences uses the correct form of the verb?',
'[{"key":"A","text":"Each of the students have submitted their papers."},{"key":"B","text":"Each of the students has submitted their papers."},{"key":"C","text":"Each of the students have submitted his papers."},{"key":"D","text":"Each of the students has submitted his paper."}]',
'B',
'When "each" is the subject, it takes a singular verb. "Each of the students HAS" is correct. Modern usage accepts "their" as a gender-neutral singular pronoun.',
'both'),

('General Education', 'Mathematics', 'Number Theory', 'medium',
'What is the least common multiple (LCM) of 12 and 18?',
'[{"key":"A","text":"6"},{"key":"B","text":"36"},{"key":"C","text":"72"},{"key":"D","text":"216"}]',
'B',
'To find LCM: 12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 4 × 9 = 36. The LCM is the smallest number that both 12 and 18 divide into evenly.',
'both'),

('Professional Education', 'Classroom Management', 'Discipline Approaches', 'medium',
'A teacher uses praise and rewards to encourage good behavior. This approach is based on which theory?',
'[{"key":"A","text":"Assertive Discipline"},{"key":"B","text":"Positive Reinforcement (Skinner)"},{"key":"C","text":"Glasser''s Choice Theory"},{"key":"D","text":"Dreikurs'' Democratic Discipline"}]',
'B',
'B.F. Skinner''s Operant Conditioning uses positive reinforcement (adding a pleasant stimulus after desired behavior) to increase the likelihood of the behavior repeating. Praise and rewards are classic positive reinforcers.',
'both'),

('Professional Education', 'Teaching Profession', 'Professional Ethics', 'easy',
'Which of the following actions violates the Code of Ethics for Professional Teachers?',
'[{"key":"A","text":"Attending professional development seminars"},{"key":"B","text":"Sharing a student''s academic records without consent"},{"key":"C","text":"Collaborating with colleagues on lesson plans"},{"key":"D","text":"Maintaining proper conduct in the classroom"}]',
'B',
'Sharing a student''s academic records without consent violates student privacy rights and the Code of Ethics for Professional Teachers, which requires confidentiality of student information.',
'both'),

('General Education', 'Science', 'Biology', 'medium',
'Which organelle is known as the "powerhouse of the cell" because it produces ATP through cellular respiration?',
'[{"key":"A","text":"Nucleus"},{"key":"B","text":"Ribosome"},{"key":"C","text":"Mitochondria"},{"key":"D","text":"Golgi Apparatus"}]',
'C',
'Mitochondria produce ATP (adenosine triphosphate) through cellular respiration, providing energy for cellular activities. They have their own DNA and double membrane, supporting the endosymbiotic theory.',
'both');
