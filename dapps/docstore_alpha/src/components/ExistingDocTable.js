import React from "react";
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';


class ExistingDocTable extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let cols = [
            {field: '_author', header: 'Author'},
            {field: '_docName', header: 'Doc Name'},
            {field: '_docHash', header: 'Doc Hash'},
        ];

        let dynamicColumns = cols.map((col,i) => {
            return <Column key={col.field} field={col.field} header={col.header} />;
        });
        console.log(this.props.docEvents);
        return (
            <DataTable value={this.props.docEvents}>
                {dynamicColumns}
            </DataTable>
        );
    }
}

export default ExistingDocTable;