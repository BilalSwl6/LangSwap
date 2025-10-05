defmodule Langswap.Repo do
  use Ecto.Repo,
    otp_app: :langswap,
    adapter: Ecto.Adapters.Postgres
end
