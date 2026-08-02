from config import INPUT_COST_PER_M, OUTPUT_COST_PER_M


class UsageTracker:
    def __init__(self):
        self.input_tokens = 0
        self.output_tokens = 0
        self.embed_tokens = 0

    def add_chat_usage(self, input_tokens: int, output_tokens: int):
        self.input_tokens += input_tokens
        self.output_tokens += output_tokens

    def add_embed_tokens(self, count: int):
        self.embed_tokens += count

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens + self.embed_tokens

    @property
    def estimated_cost(self) -> float:
        input_cost = (self.input_tokens / 1_000_000) * INPUT_COST_PER_M
        output_cost = (self.output_tokens / 1_000_000) * OUTPUT_COST_PER_M
        embed_cost = (self.embed_tokens / 1_000_000) * 0.025
        return round(input_cost + output_cost + embed_cost, 6)

    def to_dict(self) -> dict:
        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "embed_tokens": self.embed_tokens,
            "total_tokens": self.total_tokens,
            "estimated_cost_usd": self.estimated_cost,
        }


usage_tracker = UsageTracker()
