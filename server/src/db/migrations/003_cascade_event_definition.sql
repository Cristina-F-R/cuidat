ALTER TABLE health_event_logs
    DROP CONSTRAINT IF EXISTS health_event_logs_item_definition_id_fkey;

ALTER TABLE health_event_logs
    ADD CONSTRAINT health_event_logs_item_definition_id_fkey
    FOREIGN KEY (item_definition_id)
    REFERENCES health_item_definitions(id)
    ON DELETE CASCADE;