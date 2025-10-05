defmodule Langswap.Repo.Migrations.CreateMatches do
  use Ecto.Migration

  def change do
    create table(:matches) do
      add :started_at, :utc_datetime
      add :ended_at, :utc_datetime
      add :duration, :integer
      add :user1_id, references(:users, on_delete: :nothing)
      add :user2_id, references(:users, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:matches, [:user1_id])
    create index(:matches, [:user2_id])
  end
end
