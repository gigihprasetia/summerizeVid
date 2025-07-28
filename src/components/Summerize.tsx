"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/lib/utils";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Summerize = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [Items, setItems] = useState({
    source: "",
    results: "",
  });

  const handleSubmit = async (source: string) => {
    try {
      setLoading(true);
      const response = await API({
        url: "/transcript",
        method: "POST",
        data: { source },
      });
      setItems((prev) => {
        return {
          ...prev,
          results: response.data?.text,
        };
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={Items.source}
          placeholder="source url youtube"
          className="border-[1px] border-black"
          onChange={(e) => {
            setItems((prev) => {
              return {
                ...prev,
                source: e.target.value,
              };
            });
          }}
        />
        <Button onClick={() => handleSubmit(Items.source)}>Search</Button>
      </div>
      <p>Results</p>
      <div className="border-[1px] border-black p-2 rounded-md">
        {loading ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : (
          <p>{Items.results}</p>
        )}
      </div>
    </div>
  );
};

export default Summerize;
