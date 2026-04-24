import { PAGE_ROUTES } from "@/shared/constants/routes";
import { isArray } from "@/shared/utils";
import { sanitizeInternalRedirectPath } from "@/shared/utils/authRedirect";

import SigninPage from "@/domains/auth/presentation/pages/signin";

type SigninPageRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getSearchParamValue = (value: string | string[] | undefined) => {
  return isArray(value) ? value[0] : value;
};

const Signin = async ({ searchParams }: SigninPageRouteProps) => {
  const resolvedSearchParams = await searchParams;
  const redirectPath = sanitizeInternalRedirectPath(
    getSearchParamValue(resolvedSearchParams.redirect),
    PAGE_ROUTES.WORKSPACE
  );
  const isUnverifiedRedirect =
    getSearchParamValue(resolvedSearchParams.unverified) === "true";

  return (
    <SigninPage
      redirectPath={redirectPath}
      isUnverifiedRedirect={isUnverifiedRedirect}
    />
  );
};

export default Signin;
