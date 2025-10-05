defmodule Langswap.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :content, :text
      add :encrypted, :boolean, default: false, null: false
      add :sent_at, :utc_datetime
      add :match_id, references(:matches, on_delete: :nothing)
      add :sender_id, references(:users, on_delete: :nothing)

      timestamps(type: :utc_datetime)
    end

    create index(:messages, [:match_id])
    create index(:messages, [:sender_id])
  end
end
