SELECT
    p.id,
    p.post_title,
    p.post_content,
    #tr.term_taxonomy_id,
    p.guid
FROM
    wp_posts p
JOIN
    wp_icl_translations t ON p.ID = t.element_id
LEFT JOIN
    wp_term_relationships tr ON p.ID = tr.object_id
WHERE
    t.language_code = 'en'
    AND p.post_type LIKE 'product%'
    AND p.post_status = 'publish'
    AND p.post_content != ''
    AND NOT EXISTS (
        SELECT 1
        FROM wp_term_relationships tr_check
        WHERE tr_check.object_id = p.ID
            AND tr_check.term_taxonomy_id IN (450, 451, 9) #ausverkauft #sold-out #outofstock
    )
group by p.id
