defmodule Langswap.Match do
  use Ecto.Schema
  import Ecto.Changeset

  schema "matches" do
    field :started_at, :utc_datetime
    field :ended_at, :utc_datetime
    field :duration, :integer
    field :user1_id, :id
    field :user2_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(match, attrs) do
    match
    |> cast(attrs, [:started_at, :ended_at, :duration])
    |> validate_required([:started_at, :ended_at, :duration])
  end
end
