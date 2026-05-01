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
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 size-4 text-blue-700" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-blue-900">{title}</p>
          <p className="text-sm leading-6 text-blue-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
