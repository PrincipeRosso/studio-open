-- Migration: Add tool calls support to messages
-- This migration adds support for storing tool calls and their states

-- Add parts column to store message parts (including tool calls)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS parts JSONB DEFAULT NULL;

-- Add metadata column for additional message information
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Create index on parts for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_parts ON messages USING GIN (parts);

-- Create index on metadata for better query performance  
CREATE INDEX IF NOT EXISTS idx_messages_metadata ON messages USING GIN (metadata);

-- Add function to extract tool calls from parts
CREATE OR REPLACE FUNCTION extract_tool_calls(parts_json JSONB)
RETURNS JSONB AS $$
BEGIN
  IF parts_json IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT jsonb_agg(part)
    FROM jsonb_array_elements(parts_json) AS part
    WHERE part->>'type' LIKE 'tool-%'
  );
END;
$$ LANGUAGE plpgsql;

-- Add function to check if message contains tool calls
CREATE OR REPLACE FUNCTION has_tool_calls(parts_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  IF parts_json IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM jsonb_array_elements(parts_json) AS part
    WHERE part->>'type' LIKE 'tool-%'
  );
END;
$$ LANGUAGE plpgsql;

-- Create view for messages with tool calls
CREATE OR REPLACE VIEW messages_with_tools AS
SELECT 
  m.*,
  extract_tool_calls(m.parts) as tool_calls,
  has_tool_calls(m.parts) as has_tools
FROM messages m;

-- Add comment to explain the new columns
COMMENT ON COLUMN messages.parts IS 'JSONB array of message parts including tool calls, text content, etc.';
COMMENT ON COLUMN messages.metadata IS 'JSONB object containing additional message metadata like tool execution info';

-- Update RLS policies to include new columns
-- The existing policies already cover all columns, so no changes needed

-- Create function to get messages with tool calls for a thread
CREATE OR REPLACE FUNCTION get_thread_messages_with_tools(thread_uuid UUID)
RETURNS TABLE (
  id UUID,
  thread_id UUID,
  role VARCHAR(20),
  content TEXT,
  parts JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  tool_calls JSONB,
  has_tools BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.thread_id,
    m.role,
    m.content,
    m.parts,
    m.metadata,
    m.created_at,
    extract_tool_calls(m.parts) as tool_calls,
    has_tool_calls(m.parts) as has_tools
  FROM messages m
  WHERE m.thread_id = thread_uuid
  ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_thread_messages_with_tools(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION extract_tool_calls(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION has_tool_calls(JSONB) TO authenticated;
