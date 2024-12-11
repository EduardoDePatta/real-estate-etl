CREATE SCHEMA IF NOT EXISTS real_estate;

CREATE TABLE IF NOT EXISTS real_estate.portal (
  id serial4 NOT NULL,
  nome varchar(255) NOT NULL,
  url text NOT NULL,
  observacoes text NULL,
  CONSTRAINT portal_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS real_estate.captura (
  id serial4 NOT NULL,
  portal_id int4 NOT NULL,
  filtros jsonb DEFAULT '{}'::jsonb NULL,
  status varchar(50) DEFAULT 'pendente'::character varying NULL,
  data_hora_inicio timestamp NULL,
  data_hora_fim timestamp NULL,
  CONSTRAINT captura_pkey PRIMARY KEY (id),
  CONSTRAINT captura_portal_id_fkey FOREIGN KEY (portal_id) REFERENCES real_estate.portal(id)
);

INSERT INTO real_estate.portal (id, nome, url, observacoes)
VALUES(1, 'Zap Imóveis', 'https://glue-api.zapimoveis.com.br/v2/listings', 'Portal principal para imóveis de aluguel')
ON CONFLICT (id) DO NOTHING;

INSERT INTO real_estate.captura (id, portal_id, filtros, status, data_hora_inicio, data_hora_fim)
VALUES(1, 1, '{"portal": "ZAP", "business": "SALE", "listingType": "USED", "categoryPage": "RESULT", "includedFields": "search%28result%28listings%28listing%28legacyId%2Cid%2CexternalId%2Ctitle%2Cdescription%2Cportal%2CcontractType%2Caddress%2CpricingInfos%2Cbedrooms%2Cbathrooms%2CparkingSpaces%2CusableAreas%2CupdatedAt%2Clink%29%29%29%29"}'::jsonb, 'pendente', null, null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO real_estate.captura (id, portal_id, filtros, status, data_hora_inicio, data_hora_fim)
VALUES(2, 1, '{"portal": "ZAP", "business": "RENTAL", "listingType": "USED", "categoryPage": "RESULT", "includedFields": "search%28result%28listings%28listing%28legacyId%2Cid%2CexternalId%2Ctitle%2Cdescription%2Cportal%2CcontractType%2Caddress%2CpricingInfos%2Cbedrooms%2Cbathrooms%2CparkingSpaces%2CusableAreas%2CupdatedAt%2Clink%29%29%29%29"}'::jsonb, 'pendente', null, null)
ON CONFLICT (id) DO NOTHING;
