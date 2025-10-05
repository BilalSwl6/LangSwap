defmodule Langswap.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :password_hash, :string
    field :native_language, :string
    field :practice_language, :string
    field :is_admin, :boolean, default: false
    field :last_seen, :utc_datetime

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :password_hash, :native_language, :practice_language, :is_admin, :last_seen])
    |> validate_required([:email, :password_hash, :native_language, :practice_language, :is_admin, :last_seen])
    |> unique_constraint(:email)
  end
end
