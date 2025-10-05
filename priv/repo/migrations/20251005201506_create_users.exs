defmodule Langswap.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :password_hash, :string
      add :native_language, :string
      add :practice_language, :string
      add :is_admin, :boolean, default: false, null: false
      add :last_seen, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])
  end
end
