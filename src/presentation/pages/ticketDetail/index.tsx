"use client";

import TicketDetailView from "@/presentation/components/ticketDetailView/TicketDetailView";
import Container from "@/presentation/components/ui/Container";

import styles from "./styles.module.scss";

type Props = {
  projectId: string;
  ticketId: string;
};

const TicketDetailPage = ({ projectId, ticketId }: Props) => {
  return (
    <main className={styles["ticket-detail-page"]}>
      <Container
        maxWidth="large"
        className={styles["ticket-detail-page__container"]}
      >
        <TicketDetailView
          key={ticketId}
          projectId={projectId}
          ticketId={ticketId}
        />
      </Container>
    </main>
  );
};

export default TicketDetailPage;
