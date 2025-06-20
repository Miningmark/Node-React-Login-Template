import { Table } from "react-bootstrap";

const TableLoadingAnimation = ({}) => {
  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <span className="placeholder col-6"></span>
            </th>
            <th>
              <span className="placeholder col-6"></span>
            </th>
            <th>
              <span className="placeholder col-6"></span>
            </th>
            <th>
              <span className="placeholder col-6"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <tr key={idx} className="placeholder-glow">
              <td>
                <span className="placeholder col-6"></span>
              </td>
              <td>
                <span className="placeholder col-8"></span>
              </td>
              <td className="text-center">
                <span className="placeholder col-3"></span>
              </td>
              <td className="text-center">
                <span className="placeholder col-3"></span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default TableLoadingAnimation;
