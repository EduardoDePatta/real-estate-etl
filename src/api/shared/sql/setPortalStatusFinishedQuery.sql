update real_estate.captura
set status = 'concluído',
data_hora_fim = now()
where portal_id = $1;