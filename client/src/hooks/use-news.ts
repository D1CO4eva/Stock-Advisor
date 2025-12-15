import { useQuery } from "@tanstack/react-query";
import { getNews } from "@/lib/api";

export function useNews(category = "general") {
  return useQuery({
    queryKey: ["news", category],
    queryFn: () => getNews(category),
    refetchInterval: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 10,
  });
}
