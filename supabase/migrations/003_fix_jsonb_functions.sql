-- Migration: Fix JSONB functions to handle scalar values
-- This migration fixes the functions that were causing "cannot extract elements from a scalar" errors

-- Drop existing functions and dependent objects with CASCADE
DROP FUNCTION IF EXISTS extract_tool_calls(JSONB) CASCADE;
DROP FUNCTION IF EXISTS has_tool_calls(JSONB) CASCADE;
DROP VIEW IF EXISTS messages_with_tools CASCADE;
DROP FUNCTION IF EXISTS get_thread_messages_with_tools(UUID) CASCADE;

-- Create improved function to extract tool calls from parts
CREATE OR REPLACE FUNCTION extract_tool_calls(parts_json JSONB)
RETURNS JSONB AS $$
BEGIN
  -- Check if parts_json is null or not an array
  IF parts_json IS NULL OR jsonb_typeof(parts_json) != 'array' THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT jsonb_agg(part)
    FROM jsonb_array_elements(parts_json) AS part
    WHERE part->>'type' LIKE 'tool-%'
  );
END;
$$ LANGUAGE plpgsql;

-- Create improved function to check if message contains tool calls
CREATE OR REPLACE FUNCTION has_tool_calls(parts_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if parts_json is null or not an array
  IF parts_json IS NULL OR jsonb_typeof(parts_json) != 'array' THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM jsonb_array_elements(parts_json) AS part
    WHERE part->>'type' LIKE 'tool-%'
  );
END;
$$ LANGUAGE plpgsql;

-- Create improved view for messages with tool calls
CREATE OR REPLACE VIEW messages_with_tools AS
SELECT 
  m.*,
  extract_tool_calls(m.parts) as tool_calls,
  has_tool_calls(m.parts) as has_tools
FROM messages m;

-- Create improved function to get messages with tool calls for a thread
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

-- Add comment explaining the fix
COMMENT ON FUNCTION extract_tool_calls(JSONB) IS 'Safely extracts tool calls from parts JSONB, handling null and non-array values';
COMMENT ON FUNCTION has_tool_calls(JSONB) IS 'Safely checks if parts JSONB contains tool calls, handling null and non-array values';
