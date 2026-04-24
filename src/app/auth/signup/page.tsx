import { PAGE_ROUTES } from "@/shared/constants/routes";
import { isArray } from "@/shared/utils";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

import SignupPage from "@/domains/auth/presentation/pages/signup";

type SignupPageRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getSearchParamValue = (value: string | string[] | undefined) => {
  return isArray(value) ? value[0] : value;
};

const Signup = async ({ searchParams }: SignupPageRouteProps) => {
  const resolvedSearchParams = await searchParams;
  const redirectPath = sanitizeInternalRedirectPath(
    getSearchParamValue(resolvedSearchParams.redirect),
    PAGE_ROUTES.WORKSPACE
  );

  return <SignupPage redirectPath={redirectPath} />;
};

export default Signup;
