import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReactionSummary, toggleReaction } from "../api/reactionsApi";

export default function ReactionButton({ targetId, targetType }) {
  const queryClient = useQueryClient();
  const key = ["reaction", targetType, targetId];

  const summary = useQuery({
    queryKey: key,
    queryFn: () => getReactionSummary(targetId, targetType),
    enabled: Boolean(targetId),
  });

  const mutation = useMutation({
    mutationFn: () => toggleReaction(targetId, targetType),
    onSuccess: (data) => {
      queryClient.setQueryData(key, { count: data.count, hasReacted: data.active });
    },
  });

  return (
    <button
      className={`reaction-button${summary.data?.hasReacted ? " active" : ""}`}
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      aria-label="Ajouter aux favoris"
    >
      <Heart size={18} fill={summary.data?.hasReacted ? "currentColor" : "none"} />
      <span>{summary.data?.count ?? 0}</span>
    </button>
  );
}
