update real_estate.captura
set status = 'erro',
data_hora_fim = now()
where portal_id = $1;