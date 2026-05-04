"use client";

type Props = {
  userId: string;
  score: number | null;
};

export function ShareLinkedInButton({ userId, score }: Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://career-app-bice.vercel.app";
  const cardUrl = `${appUrl}/api/og/card?uid=${encodeURIComponent(userId)}`;

  const postText = [
    score !== null
      ? `My career threat level is ${score}/100 according to live macro data (Fed, BLS, HN Hiring).`
      : "I just checked my macro-driven career threat level.",
    "",
    "Trajectory.io reads public economic signals and tells me exactly what's coming and how to prepare.",
    "",
    "Try it free: trajectoryapp.io",
  ].join("\n");

  function handleShare() {
    const linkedInUrl =
      "https://www.linkedin.com/sharing/share-offsite/?" +
      new URLSearchParams({ url: cardUrl, summary: postText }).toString();
    window.open(linkedInUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-[12px] font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-md px-3 py-2 transition-all duration-150"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5 fill-current shrink-0"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      Share to LinkedIn
    </button>
  );
}
