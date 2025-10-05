defmodule Langswap.Message do
  use Ecto.Schema
  import Ecto.Changeset

  schema "messages" do
    field :content, :string
    field :encrypted, :boolean, default: false
    field :sent_at, :utc_datetime
    field :match_id, :id
    field :sender_id, :id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:content, :encrypted, :sent_at])
    |> validate_required([:content, :encrypted, :sent_at])
  end
end
