import { Skeleton } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../../layouts/AdminLayout/AdminLayout.jsx"; // import layout Admin
import { getAllArrivalPointAdminAction, getAllBoardingPointAdminAction, getAllBusesAdminAction } from "../../../redux/actions/BusAction.js";

const PrivateRouteAdmin = ({ children }) => {
  const { isAdmin, loading } = useSelector((state) => state.AdminReducer);


  // While checking authentication, show a loading skeleton
  if (loading) {
    return <Skeleton active />;
  }

  // If not an Admin, redirect to the login page
  if (!isAdmin) {
    return <Navigate to="/login-admin" />;
  }
 
  // If authenticated, render the children within the Admin layout
  return <AdminLayout>{children}</AdminLayout>;
};

export default PrivateRouteAdmin;
