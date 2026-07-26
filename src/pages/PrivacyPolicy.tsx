import React from 'react';
import LegalLayout, { LegalSection } from '../components/LegalLayout';

const EMAIL = 'contato@atssistemas.ia.br';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout
      title="Política de Privacidade"
      updatedAt="26 de julho de 2026"
      intro={
        <p>
          Esta Política de Privacidade descreve como a{' '}
          <strong className="text-white">
            ATS Sistemas de Automações
          </strong>{' '}
          coleta, utiliza, armazena e protege os dados pessoais dos visitantes
          deste site, em conformidade com a Lei nº 13.709/2018 (Lei Geral de
          Proteção de Dados Pessoais — LGPD).
        </p>
      }
    >
      <LegalSection title="1. Quem é o controlador dos dados">
        <p>
          O controlador responsável pelo tratamento dos seus dados pessoais é a
          ATS Sistemas de Automações, inscrita no CNPJ nº 65.402.484/0001-40,
          com sede em Espumoso/RS, Brasil.
        </p>
        <p>
          Para qualquer questão relacionada à privacidade e à proteção de dados,
          entre em contato pelo e-mail{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-neon-cyan hover:underline break-all"
          >
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Quais dados coletamos">
        <p>Coletamos apenas os dados necessários para cada finalidade:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-gray-200">Formulário de contato:</strong>{' '}
            nome, e-mail e, opcionalmente, telefone, empresa e o conteúdo da
            mensagem que você nos envia.
          </li>
          <li>
            <strong className="text-gray-200">Lista de espera:</strong> nome e
            e-mail informados para receber avisos sobre o lançamento de novos
            produtos.
          </li>
          <li>
            <strong className="text-gray-200">
              Dados de navegação (analytics):
            </strong>{' '}
            métricas agregadas e anônimas de uso (páginas visitadas, país,
            dispositivo), coletadas de forma que não identificam você
            individualmente e sem uso de cookies de rastreamento.
          </li>
        </ul>
        <p>
          Não coletamos dados sensíveis nem dados de crianças e adolescentes de
          forma intencional.
        </p>
      </LegalSection>

      <LegalSection title="3. Para que usamos os seus dados (finalidades)">
        <ul className="list-disc pl-5 space-y-2">
          <li>Responder às suas solicitações e mensagens de contato;</li>
          <li>
            Enviar avisos sobre o lançamento de produtos quando você se cadastra
            na lista de espera;
          </li>
          <li>
            Entender, de forma agregada, como o site é utilizado, para melhorar
            a experiência e o conteúdo;
          </li>
          <li>Cumprir obrigações legais ou regulatórias, quando aplicável.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base legal para o tratamento">
        <p>
          O tratamento dos seus dados fundamenta-se nas seguintes bases legais
          da LGPD:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-gray-200">Consentimento</strong> (art. 7º,
            I), quando você preenche o formulário de contato ou entra na lista de
            espera;
          </li>
          <li>
            <strong className="text-gray-200">Legítimo interesse</strong> (art.
            7º, IX), para a análise agregada e anônima de uso do site, sempre
            respeitando os seus direitos e liberdades.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Compartilhamento e operadores">
        <p>
          Não vendemos os seus dados pessoais. Para operar o site, utilizamos
          prestadores de serviço (operadores) que tratam dados em nosso nome:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-gray-200">Provedor de formulários:</strong>{' '}
            os dados enviados pelos formulários são processados por um serviço de
            envio de mensagens para que cheguem ao nosso e-mail;
          </li>
          <li>
            <strong className="text-gray-200">Hospedagem e analytics:</strong> o
            site é hospedado e monitorado por meio de plataforma de
            infraestrutura web que fornece métricas de uso anônimas.
          </li>
        </ul>
        <p>
          Esses serviços podem processar dados em servidores localizados fora do
          Brasil. Nesses casos, adotamos medidas para que a transferência
          internacional ocorra de acordo com a LGPD.
        </p>
      </LegalSection>

      <LegalSection title="6. Por quanto tempo guardamos os dados">
        <p>
          Mantemos os seus dados apenas pelo tempo necessário para cumprir as
          finalidades descritas nesta Política ou obrigações legais. Você pode
          solicitar a exclusão a qualquer momento, conforme a seção de direitos
          abaixo.
        </p>
      </LegalSection>

      <LegalSection title="7. Seus direitos como titular">
        <p>
          Nos termos do art. 18 da LGPD, você pode, a qualquer momento e
          gratuitamente, solicitar:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Confirmação da existência de tratamento e acesso aos dados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            Anonimização, bloqueio ou eliminação de dados desnecessários ou
            tratados em desconformidade com a lei;
          </li>
          <li>Portabilidade dos dados a outro fornecedor;</li>
          <li>
            Eliminação dos dados tratados com base no seu consentimento;
          </li>
          <li>Informação sobre com quem os dados foram compartilhados;</li>
          <li>Revogação do consentimento.</li>
        </ul>
        <p>
          Para exercer esses direitos, envie um pedido para{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-neon-cyan hover:underline break-all"
          >
            {EMAIL}
          </a>
          . Poderemos solicitar informações para confirmar a sua identidade
          antes de atender ao pedido.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Este site não utiliza cookies de publicidade ou de rastreamento
          individual. As métricas de uso são coletadas de forma anônima e
          agregada. Eventuais cookies estritamente necessários ao funcionamento
          da página não identificam você pessoalmente.
        </p>
      </LegalSection>

      <LegalSection title="9. Segurança da informação">
        <p>
          Adotamos medidas técnicas e organizacionais razoáveis para proteger os
          seus dados contra acesso não autorizado, perda, alteração ou
          divulgação indevida. Ainda assim, nenhum sistema é totalmente imune a
          riscos; em caso de incidente relevante, adotaremos as providências
          exigidas pela legislação.
        </p>
      </LegalSection>

      <LegalSection title="10. Alterações desta Política">
        <p>
          Esta Política poderá ser atualizada periodicamente. A data da última
          atualização é indicada no início do documento. Recomendamos a revisão
          regular desta página.
        </p>
      </LegalSection>

      <LegalSection title="11. Contato">
        <p>
          Dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos
          seus dados podem ser encaminhadas para{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-neon-cyan hover:underline break-all"
          >
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
