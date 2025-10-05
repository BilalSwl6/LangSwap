defmodule LangswapWeb.PageController do
  use LangswapWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
