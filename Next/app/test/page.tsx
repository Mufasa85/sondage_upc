"use client";

import { supabase } from "@/lib/supabase";
import { Suspense } from "react";

async function InstrumentsData() {
  const { data: instruments } = await supabase.from("candidat").select();

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}
