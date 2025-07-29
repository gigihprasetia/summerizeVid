"use client";
import { askToChatGPT } from "@/actions/openai";
import { getChannel, getChannelVideos } from "@/actions/youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API, askingTemplate } from "@/lib/utils";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiBell } from "react-icons/hi";
import { IoIosEye, IoIosVideocam } from "react-icons/io";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { linkToText } from "@/actions/transcrypt";
import { FaSpinner } from "react-icons/fa";

const urlExample =
  "https://www.youtube.com/watch?v=Rht8rS4cR1s&list=RDRht8rS4cR1s&start_radio=1";

const Home = () => {
  const [query, setQuery] = useState("");
  const [linkChannel, setLinkChannel] = useState("");
  const [linkVid, setLinkVid] = useState<{
    link: string | null;
    loading: boolean;
    res: any;
  }>({
    link: null,
    loading: false,
    res: null,
  });

  const [loading, setloading] = useState(false);
  const [loadingMore, setloadingMore] = useState(false);
  const [dataChannel, setDataChannel] = useState<any>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setloading(true);
    try {
      const res = await getChannel({ source: linkChannel });
      const summary = await askToChatGPT(
        askingTemplate({
          nameChannel: res?.info?.title,
          desc: res?.info?.description,
          subs: res?.info?.subscriberCount,
          vidCount: res?.info?.videoCount,
        })
      )?.then((res: any) => res?.[0]?.content?.[0]?.text);
      setDataChannel({ ...res, summary });
    } catch (err) {
      console.log(err);
      toast.error("Something Wrong");
    } finally {
      setloading(false);
    }
  };

  const handleSearchVideo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    getChannelVideos(dataChannel?.info?.id, 10, "", query)
      .then((res: any) => {
        setDataChannel((prev: any) => {
          return {
            ...prev,
            videos: res,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Wrong");
      })
      .finally(() => {
        setloadingMore(false);
      });
  };

  const loadMore = () => {
    setloadingMore(true);
    getChannelVideos(
      dataChannel?.info?.id,
      10,
      dataChannel?.videos?.nextPageToken
    )
      .then((res: any) => {
        setDataChannel((prev: any) => {
          return {
            ...prev,
            videos: {
              ...prev.videos,
              items: [...prev.videos.items, ...res.items],
            },
          };
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Wrong Load More The Videos");
      })
      .finally(() => {
        setloadingMore(false);
      });
  };

  const summerizeVid = (id: string) => {
    const formattedLink = `https://www.youtube.com/watch?v=${id}`;
    setLinkVid((prev) => {
      return { ...prev, link: formattedLink, loading: true, res: null };
    });
    linkToText({ urlYtb: formattedLink, language: "ID" })
      .then((res) => {
        setLinkVid((prev) => {
          return { ...prev, res };
        });
      })
      .catch((err) => {
        toast.error("Something Wrong Summerize");
      })
      .finally(() => {
        setLinkVid((prev) => {
          return { ...prev, loading: false };
        });
      });
  };

  console.log(dataChannel, "test");

  return (
    <div id="scrollArea" className="h-screen overflow-auto">
      <form
        className="border-b-2 sticky bg-white shadow-md top-0 p-3 flex gap-2"
        onSubmit={handleSubmit}
      >
        <Input
          required
          placeholder="Channel Url"
          className="border-[1px] border-black bg-white"
          value={linkChannel}
          onChange={(e) => {
            setLinkChannel(e.target.value);
          }}
        />
        <Button>Search</Button>
      </form>
      <div className="mt-5">
        {loading ? (
          <AiOutlineLoading3Quarters
            size={30}
            className="animate-spin my-2 mx-auto"
          />
        ) : (
          dataChannel && (
            <>
              <div className="flex gap-2 p-5">
                <div className="flex-1">
                  <p className="text-2xl font-bold mb-5">Information</p>
                  <div className="flex items-center gap-6 ">
                    <img
                      src={
                        dataChannel?.info?.thumbnails?.high?.url ||
                        dataChannel?.info?.thumbnails?.default?.url ||
                        dataChannel?.info?.thumbnails?.medium?.url
                      }
                      alt="Profile"
                      className="rounded-full w-32 h-32 object-cover"
                    />

                    <div className="flex-1">
                      <h1 className="text-2xl font-bold">
                        {dataChannel?.info?.title}
                      </h1>

                      <p className="text-gray-700 mt-2">
                        {dataChannel?.info?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-5 justify-end">
                    <div className=" flex items-center gap-2">
                      <IoIosVideocam />{" "}
                      <p>
                        {Number(dataChannel?.info?.videoCount).toLocaleString(
                          "id"
                        )}
                      </p>
                    </div>
                    <div className=" flex items-center gap-2">
                      <IoIosEye />
                      <p>
                        {Number(dataChannel?.info?.viewCount).toLocaleString(
                          "id"
                        )}
                      </p>
                    </div>
                    <div className=" flex items-center gap-2">
                      <HiBell />
                      <p>
                        {Number(
                          dataChannel?.info?.subscriberCount
                        ).toLocaleString("id")}
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold my-5">Summary Singkat</p>
                  <div className=" flex flex-col text-base gap-2">
                    {dataChannel?.summary
                      ?.split("\n")
                      ?.map((e: string, i: number) => {
                        return <p key={i}>{e}</p>;
                      })}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="mb-2  gap-2 items-center">
                    <p className="text-2xl font-bold ">Videos</p>
                    <form
                      onSubmit={handleSearchVideo}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Input
                        required
                        disabled={!dataChannel}
                        placeholder={`search video ${dataChannel?.info?.title}`}
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                        }}
                      />
                      <Button>search</Button>
                    </form>
                  </div>
                  {dataChannel?.videos?.items?.map((item: any, i: number) => {
                    return (
                      <div key={i} className="flex gap-2">
                        <img
                          src={item?.snippet?.thumbnails?.high?.url}
                          className="w-40 h-auto object-cover rounded-md"
                        />
                        <div className="flex flex-col p-2">
                          <p className="text-base font-bold w-3/4">
                            {item?.snippet?.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item?.snippet?.description}
                          </p>
                          <Button
                            className="w-fit self-end"
                            onClick={() => summerizeVid(item?.id?.videoId)}
                          >
                            Summerize
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {dataChannel?.videos?.nextPageToken && (
                    <Button
                      disabled={loadingMore}
                      onClick={loadMore}
                      // className="h-10 bg-gray-200 text-center p-2 cursor-pointer hover:bg-black hover:text-white duration-200 rounded-xl"
                    >
                      ⬇️ load more...{" "}
                      <FaSpinner
                        className={`${loadingMore ? "animate-spin" : "hidden"}`}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )
        )}
      </div>
      <Dialog
        open={linkVid.link != null}
        onOpenChange={(open) => {
          if (!open)
            setLinkVid((prev) => {
              return {
                ...prev,
                link: null,
              };
            });
        }}
      >
        <DialogContent className="min-w-11/12">
          <DialogHeader>
            <DialogTitle>Responses</DialogTitle>
          </DialogHeader>
          {linkVid?.loading ? (
            <FaSpinner className="animate-spin mx-auto" />
          ) : (
            <div className="flex gap-4">
              <div className="flex-1 h-fit max-h-52 overflow-auto">
                <p className="font-bold underline mb-2">Raw Text</p>
                {linkVid?.res?.raw && <p>{linkVid?.res?.raw}</p>}
              </div>
              <div className="flex-1 h-fit max-h-52 overflow-auto">
                <p className="font-bold underline mb-2">Summary Text</p>
                {linkVid?.res?.summary?.[0]?.content?.[0]?.text && (
                  <p>{linkVid?.res?.summary?.[0]?.content?.[0]?.text}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
