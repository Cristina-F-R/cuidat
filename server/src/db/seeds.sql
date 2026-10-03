INSERT INTO users (id, email, is_anonymous, password_hash)
VALUES ('00000000-0000-4000-8000-000000000001', 'demo@cuidat.app', FALSE, '$2b$10$obmfv9O22HAk593pIfZB7eLMfmpnil6mgZsg4poNj9F94F1cVTBia')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_anonymous = FALSE;

INSERT INTO calendar_profiles (id, user_id, name, profile_type, avatar_icon)
VALUES ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Moby', 'pet', '🐕')
ON CONFLICT (id) DO NOTHING;

INSERT INTO health_item_definitions (id, calendar_id, name, emoji, category, is_active) VALUES
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000010', 'Vómitos', '🤢', 'symptom', TRUE),
('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000010', 'Picor', '🐾', 'symptom', TRUE),
('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000010', 'Poca energía', '🪫', 'symptom', TRUE),
('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000010', 'Alimento nuevo', '🥣', 'trigger', TRUE),
('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000010', 'Paseo por hierba', '🌿', 'trigger', TRUE),
('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000010', 'Antihistamínico', '💊', 'medication', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO health_event_logs (id, calendar_id, item_definition_id, logged_at, intensity, notes) VALUES
('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000104', date_trunc('month', NOW()) + INTERVAL '2 days 18 hours', 1, 'Primera ración del alimento nuevo.'),
('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000101', date_trunc('month', NOW()) + INTERVAL '3 days 7 hours', 2, 'Vómito por la mañana; apetito normal después.'),
('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000105', date_trunc('month', NOW()) + INTERVAL '8 days 16 hours', 1, 'Paseo habitual por la zona de hierba.'),
('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000102', date_trunc('month', NOW()) + INTERVAL '9 days 10 hours', 2, 'Picor en patas detectado al día siguiente.'),
('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000106', date_trunc('month', NOW()) + INTERVAL '12 days 9 hours', 1, 'Dosis administrada según indicación veterinaria.'),
('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000103', date_trunc('month', NOW()) + INTERVAL '12 days 18 hours', 2, 'Menos actividad durante la tarde.'),
('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000104', date_trunc('month', NOW()) + INTERVAL '18 days 18 hours', 1, 'Repetición de la ración del alimento nuevo.')
ON CONFLICT (id) DO NOTHING;