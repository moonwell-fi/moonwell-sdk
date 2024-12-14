import { useEffect, useState } from "react";

export function PackegeDownloadsBadge() {
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    fetch(
      "https://api.npmjs.org/downloads/point/last-month/@moonwell-fi%2Fmoonwell-sdk",
    )
      .then((res) => res.json())
      .then((data) => setDownloads(data.downloads));
  }, []);

  return (
    <a
      href="https://www.npmjs.com/package/@moonwell-fi/moonwell-sdk"
      className="cursor-pointer h-[36px] flex-1 relative rounded-lg overflow-hidden border border-black/10 dark:border-white/20 max-lg:hidden"
      style={{ color: "inherit", maxWidth: "205px" }}
      rel="noreferrer noopener"
      target="_blank"
    >
      <div className="absolute flex z-[1] p-[6px] h-full w-full">
        <div className="flex-1 bg-white/60 dark:bg-black/40 flex items-center w-full h-full rounded-md">
          <span className="font-medium text-[15px] leading-none opacity-80 w-full text-center">
            downloads
          </span>
        </div>
        <div className="flex items-center h-full px-2">
          <span className="font-medium text-[15px] leading-none text-center w-full text-black dark:text-white">
            {downloads >= 1000000
              ? `${(downloads / 1000000).toFixed(1)}m`
              : downloads >= 1000
                ? `${(downloads / 1000).toFixed(1)}k`
                : downloads}
            /month
          </span>
        </div>
      </div>
      <div className="absolute left-0 right-0 top-0 bottom-0 bg-black/5 dark:bg-white/5 z-[0]" />
      <div className="absolute left-0 right-0 top-0 bottom-0 backdrop-blur-[2px] backdrop-filter z-[0]" />
    </a>
  );
}
