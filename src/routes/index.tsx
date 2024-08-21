import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "./ProtectedRoutes";
import App from "../App";

import CustomLayout from "../components/layout/custom-layout/CustomLayout";
import ErrorBoundary from "../components/layout/error/ErrorBoundary";

// Lazy Loading all the pages
const CreateMentor = lazy(()=>import("../pages/form/CreateMentor"));
const Mentors = lazy((): any => import("../pages/mentors/Mentors"));
const NotFound = lazy((): any => import("../pages/not-found"));
const AllUsers = lazy((): any => import("../pages/all-users/AllUsers"));
const Journal = lazy((): any => import("../pages/journal/Journal"));
const UserProfile = lazy((): any => import("../pages/user-profile/UserProfile"));
const AllQuestions = lazy((): any => import("../pages/questions/Questions"));
const QuestionsAnalytics = lazy((): any => import("../pages/questions/Analytics"));

const MentorLogin = lazy((): any => import("../pages/mentor-login/MentorLogin"));
const AdminLogin = lazy((): any => import("../pages/admin-login/AdminLogin"));
const MentorDashboard = lazy((): any => import("../pages/mentor-dashboard/MentorDashboard"));
const AdminDashboard = lazy((): any => import("../pages/admin-dashboard/AdminDashboard"));
const CommunityPage = lazy((): any => import("../pages/community"));
const LivePage = lazy((): any => import("../pages/live/LivePage"));

const AllBDUSers = lazy((): any => import("../pages/all-bd-users/AllBDUsers"));
const BDUserProfile = lazy((): any => import("../pages/bd-user-profile/BDUserProfile"));

const AlertPage = lazy((): any => import("../pages/alerts/Alerts"));


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <Suspense fallback={<CustomLayout> </CustomLayout>}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: <App />,
      },
      {
        path: "login",
        children: [
          { path: "", element: <Navigate to={"/admin"} /> },
          { path: "admin", element: <AdminLogin /> },
          { path: "mentor", element: <MentorLogin /> },
        ],
      },
      {
        path: "admin",
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: "", element: <AdminDashboard /> },
          { path: "users", element: <AllUsers /> },
          { path: "mentors", element: <Mentors /> },
          { path: "questions", element: <AllQuestions /> },
          { path: "questions/analytics", element: <QuestionsAnalytics /> },
          { path: "journals", element: <Journal /> },
          { path: "user/:userId", element: <UserProfile /> },
          { path: "create-mentor", element: <CreateMentor /> },
          { path: "community", element: <CommunityPage /> },
          { path: "live", element: <LivePage /> },

          { path: "sales", element: <AllBDUSers /> },
          { path: "sales/:userId", element: <BDUserProfile /> },

          { path: "alerts", element: <AlertPage /> },

        ],
      },
      {
        path: "mentor",
        element: <ProtectedRoute role="mentor" />,
        children: [
          { path: "", element: <Navigate to={"/mentor/home"} /> },
          { path: "home", element: <MentorDashboard /> },
          { path: "users", element: <AllUsers /> },
          { path: "journals", element: <Journal /> },
          { path: "user/:userId", element: <UserProfile /> },
        ],
      },
      {
        path: "forbidden",
        element: <NotFound />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
