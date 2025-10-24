-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    agent_id VARCHAR(100) DEFAULT 'studio',
    agent_name VARCHAR(100) DEFAULT 'Studio',
    model_id VARCHAR(200) DEFAULT 'gpt-4.1-mini',
    model_name VARCHAR(200) DEFAULT 'GPT-4.1 Mini',
    model_provider VARCHAR(100) DEFAULT 'OpenAI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for threads
CREATE TRIGGER update_threads_updated_at 
    BEFORE UPDATE ON threads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for threads
CREATE POLICY "Users can view own threads" ON threads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads" ON threads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads" ON threads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads" ON threads
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in own threads" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own threads" ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in own threads" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in own threads" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );