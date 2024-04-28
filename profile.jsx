import React, { useEffect, useState } from 'react';
import { GET } from 'utils';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Button, Card, Space, Table } from 'antd';

import translate from 'i18n/translate';
import Link from 'next/link';

const gridStyle = {
    width: '20%',
    textAlign: 'center'
};

const columns = [
    {
        title: translate('user_opportunity_name'),
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: translate('user_opportunity_company'),
        dataIndex: 'company',
        key: 'company'
    },
    {
        title: translate('user_opportunity_date'),
        dataIndex: 'created',
        key: 'created'
    },
    {
        title: translate('user_opportunity_customId'),
        dataIndex: 'customId',
        key: 'customId'
    },
    {
        title: translate('user_opportunity_status'),
        key: 'statusTranslated',
        dataIndex: 'statusTranslated'
        // ),
    },
    {
        title: translate('user_opportunity_applicationFees'),
        dataIndex: 'applicationFees',
        key: 'applicationFees'
    },
    {
        title: translate('user_opportunity_paidApplicationFees'),
        dataIndex: 'paidApplicationFees',
        key: 'paidApplicationFees'
    },
    {
        title: translate('user_opportunity_actions'),
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                {
                    record.status === 'draft' && (
                        <Link href={`/applications/new-application?id=${record.opportunityId}`} passHref>
                            <Button type="primary">{translate('user_opportunity_continue_submit')}</Button>
                        </Link>
                    )
                }
            </Space>
        )
    }
];

function Profile () {
    const AuthSlice = useSelector((state) => state.AuthSlice);
    const [currentLang, setcurrentLang] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [applications, setApplications] = useState(null);

    useEffect(() => {
        getData();
        getApplicationsList();
        setcurrentLang(localStorage.getItem('inboardUserLocalization'));
    }, []);

    async function getData() {
        const userProfile = await GET({ endpoint: '/api/applicant/user/view/', token: AuthSlice.token });
        if (!userProfile?.user) {
            return;
        }

        if (userProfile.user.dateOfBirth) {
            userProfile.user.dateOfBirth = moment(userProfile.user.dateOfBirth);
        }
        setUserProfile(userProfile.user);
    }

    async function getApplicationsList() {
        const applicationsList = await GET({
            endpoint: '/api/applicant/applications/list/sortBy-createdAt/200/1/',
            token: AuthSlice.token
        });
        if (!applicationsList?.applications) {
            return;
        }
        const data = [];

        applicationsList.applications.forEach((app, index) => {

            data.push({
                id: app._id,
                key: index,
                name: currentLang === 'ar' ? app.opportunityId.title.arabic : app.opportunityId.title.english,
                company: app.opportunityId.companyId.name,
                opportunityId: app.opportunityId._id,
                created: moment(app.createdAt).format('YYYY-MM-DD'),
                customId: app.customId,
                statusTranslated: translate(app.status),
                status: app.status,
                applicationFees: app.applicationFees,
                paidApplicationFees: app.paidApplicationFees,
                opportunityFees: app.opportunityFees,
                paidOpportunityFees: app.paidOpportunityFees
            });
        });
        setApplications(data);
    }

    return (
        <>
            <div className="profile-view">
                <div className="container">
                    <div className="basicData">
                        {userProfile ? (
                            <>
                                <Card title={translate('user_profile_title')}>
                                    { userProfile.firstName &&
                                 <Card.Grid style={gridStyle}>

                                     <strong>{translate('user_name')}</strong>
                                     <p>{`${userProfile.firstName} ${userProfile.lastName}`}</p>
                                 </Card.Grid>
                                    }
                                    { userProfile.email &&
                                 <Card.Grid style={gridStyle}>
                                     <strong>{translate('user_email')}</strong>
                                     <p>{userProfile.email}</p>
                                 </Card.Grid>
                                    }
                                    { userProfile.gender &&
                                 <Card.Grid style={gridStyle}>
                                     <strong>{translate('user_gender')}</strong>
                                     <p>{translate(userProfile.gender)}</p>
                                 </Card.Grid>
                                    }
                                    { userProfile.mobile &&
                                 <Card.Grid style={gridStyle}>
                                     <strong>{translate('user_mobile')}</strong>
                                     <p style={{ direction: 'ltr' }}>{`+${userProfile.mobileCC} ${userProfile.mobile}`}</p>
                                 </Card.Grid>
                                    }
                                    { userProfile.nationality &&
                                 <Card.Grid style={gridStyle}>
                                     <strong>{translate('user_nationality')}</strong>
                                     <p>{userProfile.nationality}</p>
                                 </Card.Grid>
                                    }
                                </Card>
                            </>
                        ) : null}
                    </div>
                    {applications?.length ?
                        <div className="applicationList">
                            <h1>{translate('applications_list')}</h1>
                            <Table columns={columns} dataSource={applications} />
                        </div>:null
                    }
                </div>
            </div>
        </>
    );
}

export default Profile;