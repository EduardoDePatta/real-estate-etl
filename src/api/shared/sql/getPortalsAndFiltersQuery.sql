SELECT
  p.id as portal_id,
  p.nome,
  p.url,
  c.filtros
FROM
  real_estate.portal p
LEFT JOIN
  real_estate.captura c ON p.id = c.portal_id
WHERE
  p.id = $1;