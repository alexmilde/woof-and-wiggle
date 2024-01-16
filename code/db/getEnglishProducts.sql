SELECT p.id, p.post_title, p.post_content, p.guid
FROM wp_posts p
JOIN wp_icl_translations t ON p.ID = t.element_id
WHERE t.language_code = 'en'
and p.post_type like 'product%'
and p.post_status = 'publish'
and p.post_content != ''
