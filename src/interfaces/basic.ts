export enum TransactionType {
  ISSUE = 'ISS',
  TRANSFER_IN = 'TRN_IN',
  TRANSFER_OUT = 'TRN_OUT',
  RECEIVE = 'REV',
  RECEIVE_OTHER = 'REV_OTHER',
  REQUISITION_IN = 'REQ_IN',
  REQUISITION_OUT = 'REQ_OUT',
  ISSUE_TRANSACTION = 'IST',
  ADJUST = 'ADJUST',
  HIS = 'HIS',
  ADDITION_IN = 'ADD_IN',
  ADDITION_OUT = 'ADD_OUT',
  RETURNED = 'RETURNED',
  BORROW_OTHER_IN = 'BORROW_OTHER_IN',
  BORROW_OTHER_OUT = 'BORROW_OTHER_OUT',
  BORROW_IN = 'BORROW_IN',
  BORROW_OUT = 'BORROW_OUT',
  REPACK_IN = 'REP_IN',
  REPACK_OUT = 'REP_OUT'
}

export interface IStockcardItem {
  stock_date?: any,
  product_id?: any,
  generic_id?: any,
  unit_generic_id?: any,
  transaction_type?: any,
  document_ref_id?: any,
  document_ref?: any,
  in_qty?: number,
  in_unit_cost?: number,
  out_qty?: number,
  out_unit_cost?: number,
  balance_generic_qty?: number,
  balance_qty?: number,
  balance_unit_cost?: number,
  ref_src?: any,
  ref_dst?: any,
  comment?: any
  lot_no?: any,
  lot_time?: any,
  expired_date?: any,
  wm_product_id_in?: any,
  wm_product_id_out?: any,
}