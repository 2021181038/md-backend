import { supabase } from "../supabaseClient";

// 이벤트 목록 조회
export const fetchEventList = async () => {
  const { data, error } = await supabase
    .from("events")
    .select("event_name, last_saved_time")
    .order("created_at", { ascending: false });
  return { data, error };
};

// 이벤트 상세 조회 (orders + agents)
export const fetchEventDetails = async (eventName) => {
  const [ordersRes, agentsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("event_name", eventName)
      .order("order_index"),
    supabase.from("agents").select("*").eq("event_name", eventName),
  ]);
  return { ordersRes, agentsRes };
};

// 주문 업데이트
export const updateOrder = async (id, updates) => {
  return await supabase.from("orders").update(updates).eq("id", id);
};

// 주문 삭제
export const deleteOrder = async (id) => {
  return await supabase.from("orders").delete().eq("id", id);
};

// 주문 추가
export const insertOrder = async (orderData) => {
  return await supabase.from("orders").insert([orderData]);
};

// 주문 인덱스 업데이트
export const updateOrderIndices = async (sortedOrders) => {
  return await Promise.all(
    sortedOrders.map((row, i) =>
      supabase.from("orders").update({ order_index: i }).eq("id", row.id)
    )
  );
};

// 마진 조회
export const fetchMargins = async (eventName) => {
  return await supabase
    .from("margins")
    .select("option_name, margin")
    .eq("event_name", eventName);
};

// 마지막 저장 시간 조회
export const fetchLastSavedTime = async (eventName) => {
  return await supabase
    .from("events")
    .select("last_saved_time")
    .eq("event_name", eventName)
    .single();
};

// 이벤트 삭제
export const deleteEvent = async (eventName) => {
  return await supabase.from("events").delete().eq("event_name", eventName);
};

// 이벤트 생성
export const createEvent = async (eventName) => {
  return await supabase.from("events").insert([{ event_name: eventName }]);
};

// 구매자 업데이트
export const updateAgent = async (id, updates) => {
  return await supabase.from("agents").update(updates).eq("id", id);
};

// 구매자 삭제
export const deleteAgent = async (id) => {
  return await supabase.from("agents").delete().eq("id", id);
};

// 구매자 추가
export const insertAgent = async (agentData) => {
  return await supabase.from("agents").insert([agentData]).select();
};

// 주문 조회 (옵션명 기준)
export const getOrderByOptionName = async (eventName, optionName) => {
  return await supabase
    .from("orders")
    .select("id, proxy_qty, needed_qty")
    .eq("event_name", eventName)
    .eq("option_name", optionName)
    .maybeSingle();
};

// 주문 업데이트 (이벤트명 + 옵션명 기준)
export const updateOrderByEventAndOption = async (eventName, optionName, updates) => {
  return await supabase
    .from("orders")
    .update(updates)
    .eq("event_name", eventName)
    .eq("option_name", optionName);
};

// 마진 삭제 및 삽입
export const replaceMargins = async (eventName, marginData) => {
  const { error: deleteError } = await supabase
    .from("margins")
    .delete()
    .eq("event_name", eventName);

  if (deleteError) throw deleteError;

  return await supabase
    .from("margins")
    .insert(marginData)
    .select();
};

