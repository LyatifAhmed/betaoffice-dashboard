import { GetServerSidePropsContext } from "next";

export default function LogoutPage() {
  return null; // Bu sayfa hiç gösterilmeyecek çünkü hemen yönlendirme yapılır
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Cookie’yi sil
  context.res.setHeader("Set-Cookie", `external_id=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`);

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}
