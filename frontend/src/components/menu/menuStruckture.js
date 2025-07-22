import { ReactComponent as DashboardIcon } from "assets/icons/dashboard.svg";
import { ReactComponent as AdminPanelIcon } from "assets/icons/admin_panel.svg";
import { ReactComponent as TauntIcon } from "assets/icons/taunt.svg";
import { ReactComponent as KanbanlIcon } from "assets/icons/kanban.svg";
import { ReactComponent as NewspaperIcon } from "assets/icons/newspaper.svg";
import { ReactComponent as ContactsIcon } from "assets/icons/contacts.svg";
import { ReactComponent as InfoIcon } from "assets/icons/info.svg";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  {
    name: "Admin",
    icon: <AdminPanelIcon />,
    subItems: [
      {
        name: "Serverlog",
        path: "/admin/server-log",
        allowedRouteGroups: ["adminPageServerLogRead"],
      },
      {
        name: "Berechtigungsmatrix",
        path: "/admin/permissionmatrix",
        allowedRouteGroups: ["adminPagePermissionsRead", "adminPagePermissionsWrite"],
      },
      {
        name: "User Benachrichtigungen",
        path: "/admin/user-notifications",
        allowedRouteGroups: [],
      },
    ],
  },
  {
    name: "User Management",
    icon: <TauntIcon />,
    subItems: [
      { name: "Benutzer Verwaltung", path: "/usermanagement/users", allowedRouteGroups: [] },
      { name: "Rechte Übersicht", path: "/" },
    ],
  },
  { name: "Test1", path: "/", icon: <KanbanlIcon /> },
  { name: "Test2", path: "/", icon: <NewspaperIcon /> },
  { name: "Test3", path: "/", icon: <ContactsIcon /> },
];

export default menuItems;
