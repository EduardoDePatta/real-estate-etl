import { SqlLoader } from '../../../helpers'

const getPortalsAndFiltersQuery = SqlLoader.getQuery(__dirname, 'getPortalsAndFiltersQuery.sql')
const setPortalStatusFinishedQuery = SqlLoader.getQuery(__dirname, 'setPortalStatusFinishedQuery.sql')
const setPortalStatusRunningQuery = SqlLoader.getQuery(__dirname, 'setPortalStatusRunningQuery.sql')
const setPortalStatusErrorQuery = SqlLoader.getQuery(__dirname, 'setPortalStatusErrorQuery.sql')

export { getPortalsAndFiltersQuery, setPortalStatusFinishedQuery, setPortalStatusRunningQuery, setPortalStatusErrorQuery }
