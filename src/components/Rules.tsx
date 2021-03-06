import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { StyledTableCell, StyledTableRow } from "./../core/Table";
import { Button, TablePagination } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import createRuleModelMutation from "./RuleModel";
import { env } from "../core/Environment";
import axios from "axios";
import { useQuery } from "react-query";
import RuleModel from "./RuleModel";

export const getRuleTypes = async () => {
  const { data } = await axios.get(
    `${env.apiHostName}/${env.apis.getRuleTypes}`
  );
  return data;
};

export const getRuleIdsForRuleType = async (type: string) => {
  const { data } = await axios.get(
    `${env.apiHostName}/${env.apis.getRuleIdsForRuleType}/?ruleType=${type}`
  );
  return data;
};

export const getRuleModelForRuleId = async (id: string) => {
  const { data } = await axios.get(
    `${env.apiHostName}/${env.apis.getRuleModel}/?ruleId=${id}`
  );
  return data;
};

const getRuleModels = async () => {
  const { data } = await axios.get(
    `${env.apiHostName}/${env.apis.getRuleModel}`
  );
  return data as Array<any>;
};

// const getRuleModels = async () => {
//   const ruleTypes = await getRuleTypes();
//   // ruleTypes.map(({id}) => id) do parallel get to fetch all ids, then get all rules
//   const ids = ((await axios
//     .all(
//       (ruleTypes as Array<{ id: string }>).map(({ id }) =>
//         getRuleIdsForRuleType(id)
//       )
//     )
//     .then(
//       axios.spread((...responses) => {
//         return responses;
//       })
//     )) as Array<any>).flat();
//   const data = ((await axios
//     .all((ids as Array<string>).map((id) => getRuleModelForRuleId(id)))
//     .then(
//       axios.spread((...responses) => {
//         return responses.map((item, idx) => ({ ...item, ruleId: ids[idx] }));
//       })
//     )) as Array<any>).flat();
//   return data;
// };

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
  root: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    listStyle: "none",
    padding: "5px",
    margin: 0,
    marginTop: "8px",
  },
  chip: {
    margin: "2px",
  },
  attributeLabel: {
    paddingTop: "8px",
    display: "flex",
    alignItems: "center",
  },
  attributeInputBlur: {
    opacity: 0.3,
  },
  attributeInputFocus: {
    opacity: 1,
  },
});

const mockAPIData = [
  {
    ruleId: "R00007845",
    ruleName: "BaNCS SP Cash Booking",
    ruleType: "ACC",
    attributes: [
      {
        id: "ATTR001",
        name: "dr_cr_flag",
        type: "ENUM",
        values: ["DR", "CR"],
      },
      {
        id: "ATTR002",
        name: "currency",
        type: "CHAR",
        length: "4",
      },
      {
        id: "ATTR003",
        name: "amount",
        type: "DECIMAL",
        length: "21,9",
      },
      {
        id: "ATTR004",
        name: "entry_time",
        type: "TIME",
      },
    ],
  },
];

const Rules = () => {
  const classes = useStyles();
  const {
    data: rows,
    isFetching: isRuleModelsFetching,
    status,
    error,
  } = useQuery("ruleModels", getRuleModels);
  const [selectedRule, setSelectedRule] = useState<
    typeof mockAPIData[0] | null
  >(null);
  const [open, setOpen] = useState(false);
  // const [rows, setRows] = useState(mockAPIData);
  const history = useHistory();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {selectedRule && (
        <RuleModel
          open={!!selectedRule}
          event={selectedRule}
          onClose={() => {
            setSelectedRule(null);
          }}
        />
      )}
      {open && (
        <RuleModel
          isNew
          open
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
      <Box display="flex" justifyContent="flex-end" marginBottom="20px">
        <Button
          color="primary"
          variant="outlined"
          size="small"
          onClick={() => setOpen(true)}
        >
          + New Rule
        </Button>
      </Box>
      <Box>
        {isRuleModelsFetching ? (
          "Loading"
        ) : status === "error" ? (
          <span>Error: {(error as any)?.message}</span>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="Rules">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Rule ID</StyledTableCell>
                    <StyledTableCell>Rule Name</StyledTableCell>
                    <StyledTableCell>Rule Type</StyledTableCell>
                    <StyledTableCell>Edit / Show</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rows || [])
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: any) => (
                      <StyledTableRow key={row.ruleId}>
                        <StyledTableCell component="th" scope="row">
                          {row.ruleId}
                        </StyledTableCell>
                        <StyledTableCell>{row.ruleName}</StyledTableCell>
                        <StyledTableCell>{row.ruleType}</StyledTableCell>
                        <StyledTableCell>
                          <Button
                            color="primary"
                            variant="outlined"
                            size="small"
                            onClick={() => setSelectedRule(row)}
                          >
                            Show/ Edit Details
                          </Button>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={(rows || []).length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Rules;
