import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";

const reviews = [
    {
      name: "0xCA12A...507B9",
      username: "0x_johnsonchin",
      body: "Pepewagon has helped me in planning my trips often",
      img: "https://avatar.vercel.sh/jack",
    },
    {
      name: "0xD5E21...B41L8",
      username: "seanhoe.eth",
      body: "A man with a plan is a dangerous man",
      img: "https://avatar.vercel.sh/jill",
    },
    {
      name: "0x12HDW...0J1U3",
      username: "johndoe.eth",
      body: "My walk to work has been more meaningful with Pepewagon",
      img: "https://avatar.vercel.sh/john",
    },
    {
      name: "0xN2A1X...5D2O3",
      username: "mariotaning.eth",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/jane",
    },
    {
      name: "0x1S9JW...9IW12",
      username: "vandycklai.eth",
      body: "This is crazy!",
      img: "https://avatar.vercel.sh/jenny",
    },
    {
      name: "0xZ14NS...1J9W3",
      username: "aqiljaafree.eth",
      body: "I'm at a loss for words. This is amazing. I love it.",
      img: "https://avatar.vercel.sh/james",
    },
  ];

  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);

  const ReviewCard = ({
    img,
    name,
    username,
    body,
  }: {
    img: string;
    name: string;
    username: string;
    body: string;
  }) => {
    return (
      <figure
        className={cn(
          "relative w-64 cursor-pointer overflow-hidden rounded-xl",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        )}
      >
        <div className="flex flex-row items-center gap-2">
          <img className="rounded-full" width="32" height="32" alt="" src={img} />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-white">{username}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm text-white">{body}</blockquote>
      </figure>
    );
  };
   
  export default function Features() {
    return (
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg md:shadow-xl">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black dark:from-background"></div>
      </div>
    );
  }