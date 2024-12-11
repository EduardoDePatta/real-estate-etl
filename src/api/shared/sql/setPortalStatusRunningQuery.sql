update real_estate.captura
set status = 'rodando',
data_hora_inicio = now()
where portal_id = $1;