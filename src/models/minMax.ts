import Knex = require('knex');
import * as moment from 'moment';

export class MinMaxModel {

  getHeader(knex: Knex, warehouseId: any) {
    let sql = `
      select from_stock_date, to_stock_date
      from mm_generic_planning
      where warehouse_id = ?
      and is_active = 'Y'
      limit 1
    `;
    return knex.raw(sql, [warehouseId]);
  }

  getMinMax(knex: Knex, warehouseId: string, genericGroups: any[], genericType: any) {
    let query = knex('mm_generics as g')
      .select('wp.warehouse_id', 'g.generic_id', 'g.generic_name', 'g.working_code', 'g.primary_unit_id'
        , knex.raw('ifnull(gp.min_qty, 0) as min_qty')
        , knex.raw('ifnull(gp.max_qty, 0) as max_qty')
        , 'u.unit_name', 'gp.use_per_day', 'gp.safty_stock_day', 'gp.use_total', knex.raw('sum(wp.qty) as qty'))
      .innerJoin('mm_products as mp', 'mp.generic_id', 'g.generic_id')
      .innerJoin('wm_products as wp', 'wp.product_id', 'mp.product_id')
      .join('mm_units as u', 'u.unit_id', 'g.primary_unit_id')
      .joinRaw('left join mm_generic_planning as gp on gp.generic_id=g.generic_id and gp.warehouse_id = wp.warehouse_id')
      .where('wp.warehouse_id', warehouseId);

    if (genericType) {
      query.where('g.generic_type_id', genericType);
    } else {
      query.whereIn('g.generic_type_id', genericGroups)
    }

    query.groupBy('g.generic_id')
      .orderBy('g.generic_name');

    return query;
  }

  calculateMinMax(knex: Knex, warehouseId: any, fromDate: any, toDate: any) {
    let sql = `
      select mp.generic_id, mg.working_code, mg.generic_name, sum(wp.qty) qty, mu.unit_name 
      , IFNULL(sc.use_total, 0) use_total, IFNULL(CEIL(sc.use_per_day), 0) use_per_day
      , IFNULL(gp.safty_stock_day, 0) safty_stock_day, mg.primary_unit_id
      from wm_products wp
      join mm_products mp on mp.product_id = wp.product_id
      join mm_generics mg on mg.generic_id = mp.generic_id
      join mm_units mu on mu.unit_id = mg.primary_unit_id
      left join mm_generic_planning gp on gp.generic_id = mp.generic_id and gp.warehouse_id = wp.warehouse_id
      left join (
        select 
        ws.generic_id
        , SUM(ws.out_qty) use_total
        , IFNULL(SUM(ws.out_qty), 0) / (DATEDIFF(?, ?)+1) use_per_day
        from wm_stock_card ws
        where ws.ref_src = ?
        and ws.transaction_type in ('TRN_OUT', 'ISS', 'HIS')
        and (date(ws.stock_date) between ? and ?)
        group by ws.generic_id
      ) sc on sc.generic_id = mp.generic_id
      where wp.warehouse_id = ?
      group by mp.generic_id
      order by mg.generic_name
    `;
    return knex.raw(sql, [toDate, fromDate, warehouseId, fromDate, toDate, warehouseId]);
  }

  saveGenericPlanning(knex: Knex, generics: any, warehouseId: any, fromDate: any, toDate: any) {
    let sqls = [];
    generics.forEach(g => {
      let sql = `
          INSERT INTO mm_generic_planning (
            warehouse_id, generic_id, primary_unit_id, min_qty, max_qty
            , use_per_day, safty_stock_day, from_stock_date, to_stock_date, use_total
          )
          VALUES (
            ${warehouseId}, '${g.generic_id}', ${g.primary_unit_id}, ${g.min_qty}, ${g.max_qty}, 
            ${g.use_per_day}, ${g.safty_stock_day}, '${fromDate}', '${toDate}', ${g.use_total}
          )
          ON DUPLICATE KEY UPDATE
          primary_unit_id = ${g.primary_unit_id}
          , min_qty = ${g.min_qty}
          , max_qty = ${g.max_qty}
          , use_per_day = ${g.use_per_day}
          , safty_stock_day = ${g.safty_stock_day}
          , from_stock_date = '${fromDate}'
          , to_stock_date = '${toDate}'
          , use_total = '${g.use_total}'
        `;
      sqls.push(sql);
    });

    let queries = sqls.join(';');

    return knex.raw(queries);
  }
}