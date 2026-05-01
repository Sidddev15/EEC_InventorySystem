import { Sparkles } from "lucide-react";

type InlineAiSuggestionProps = {
  title?: string;
  message: string;
};

export function InlineAiSuggestion({
  title = "AI suggestion",
  message,
}: InlineAiSuggestionProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-xs md:p-3 md:text-sm">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 size-4 text-blue-700" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-blue-900 md:text-sm">{title}</p>
          <p className="text-xs leading-5 text-blue-800 md:text-sm md:leading-6">{message}</p>
        </div>
      </div>
    </div>
  );
}
