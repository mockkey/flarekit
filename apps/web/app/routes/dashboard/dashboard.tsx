import { redirect } from "react-router";

export const loader = () => {
  return redirect("/resources");
};

export default function Dashboard() {
  return <>Dashboard</>;
}
