USE [OthelloPlatform]
GO
/****** Object:  Table [dbo].[Competition]    Script Date: 2022/6/15 下午 12:40:19 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Competition](
	[id] [varchar](500) NOT NULL,
	[type] [varchar](15) NULL,
	[time_limit] [float] NULL,
	[status] [varchar](10) NULL,
	[create_time] [datetime] NOT NULL,
	[board_size] [int] NULL,
 CONSTRAINT [PK_competition] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論決賽', N'knockout', 15, N'ended', CAST(N'2021-12-02T13:43:54.270' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論初賽1', N'round-robin', 15, N'ended', CAST(N'2021-12-02T13:43:02.277' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論初賽2', N'round-robin', 15, N'ended', CAST(N'2021-12-02T13:43:12.917' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論初賽3', N'round-robin', 15, N'ended', CAST(N'2021-12-02T13:43:17.257' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論初賽4', N'round-robin', 15, N'ended', CAST(N'2021-12-02T13:43:21.250' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論初賽5', N'round-robin', 15, N'ended', CAST(N'2021-12-02T13:43:24.607' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'110人工智慧導論挑戰賽', N'round-robin', 15, N'ended', CAST(N'2021-12-02T15:17:50.940' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TAAI - Othello8X8', N'round-robin', 15, N'ended', CAST(N'2021-11-19T16:40:08.077' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA 10', N'round-robin', 30, N'ended', CAST(N'2021-07-10T15:05:42.963' AS DateTime), 10)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA-12', N'round-robin', 15, N'ended', CAST(N'2021-07-10T10:41:26.830' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA-13', N'round-robin', 15, N'ended', CAST(N'2021-07-10T10:41:36.180' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA-14', N'round-robin', 15, N'ended', CAST(N'2021-07-10T10:41:39.933' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA-23', N'round-robin', 15, N'ended', CAST(N'2021-07-10T10:41:43.740' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA-24', N'round-robin', 15, N'ended', CAST(N'2021-07-10T10:41:49.443' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2021 TCGA-34', N'round-robin', 15, N'ended', CAST(N'2021-07-10T10:41:56.493' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 10x10 blitz 123', N'round-robin', 10, N'ended', CAST(N'2022-05-14T10:17:33.063' AS DateTime), 10)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 10x10 blitz 1-4', N'round-robin', 15, N'ended', CAST(N'2022-05-14T12:01:42.717' AS DateTime), 10)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 10x10 blitz 2-4', N'round-robin', 10, N'ended', CAST(N'2022-05-14T10:18:03.450' AS DateTime), 10)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 10x10 blitz 2-4_', N'round-robin', 15, N'ended', CAST(N'2022-05-14T13:42:57.603' AS DateTime), 10)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 10x10 blitz 3-4', N'round-robin', 15, N'ended', CAST(N'2022-05-14T13:18:09.137' AS DateTime), 10)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 8x8 blitz 1-2', N'round-robin', 2.5, N'ended', CAST(N'2022-05-14T09:52:46.743' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 8x8 blitz 1-3', N'round-robin', 10, N'ended', CAST(N'2022-05-14T10:12:05.680' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA 8x8 blitz 2-3', N'round-robin', 10, N'ended', CAST(N'2022-05-14T10:45:11.317' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA othello 8x8 1-2', N'round-robin', 15, N'ended', CAST(N'2022-05-14T10:53:48.567' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA othello 8x8 1-3', N'round-robin', 15, N'ended', CAST(N'2022-05-14T10:53:54.497' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA othello 8x8 1-4', N'round-robin', 15, N'ended', CAST(N'2022-05-14T10:53:59.553' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA othello 8x8 2-4', N'round-robin', 15, N'ended', CAST(N'2022-05-14T10:54:13.403' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'2022 TCGA othello 8x8 3-4', N'round-robin', 15, N'ended', CAST(N'2022-05-14T10:54:23.387' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'F13uTQ7oG4', N'knockout', 15, N'ended', CAST(N'2021-06-24T16:46:58.227' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final', N'knockout', 2, N'ended', CAST(N'2022-06-09T15:04:00.047' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2', N'knockout', 2, N'ended', CAST(N'2022-06-09T15:46:32.260' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-A', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:44:23.030' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-B', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:44:32.530' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-C', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:44:54.350' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-D', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:45:03.657' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-E', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:45:12.310' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-F', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:45:19.723' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-G', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:45:33.100' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-H', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:45:42.133' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-I', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:45:51.490' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-J', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:54:59.517' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-K', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:56:34.880' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-L', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:58:46.923' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-M', N'round-robin', 2, N'ended', CAST(N'2022-06-09T16:03:45.740' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-N', N'knockout', 2, N'ended', CAST(N'2022-06-09T16:06:08.197' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-O', N'round-robin', 2, N'ended', CAST(N'2022-06-09T16:07:49.933' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-P', N'round-robin', 2, N'ended', CAST(N'2022-06-09T16:09:44.273' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-Q', N'knockout', 2, N'ended', CAST(N'2022-06-09T16:11:20.733' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-R', N'knockout', 2, N'ended', CAST(N'2022-06-09T16:13:56.443' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final2-S', N'knockout', 2, N'ended', CAST(N'2022-06-09T16:14:50.487' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-A', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:36:45.673' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-B', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:36:57.110' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-C', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:37:04.140' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-D', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:37:14.950' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-E', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:37:37.257' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-F', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:37:49.837' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-G', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:37:58.923' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-I', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:38:32.790' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-J', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:38:42.520' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-K', N'round-robin', 2, N'ended', CAST(N'2022-06-09T14:38:57.210' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-L', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:01:07.033' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'Final-M', N'round-robin', 2, N'ended', CAST(N'2022-06-09T15:10:59.597' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'KB6tRtRq7U', N'round-robin', 15, N'ended', CAST(N'2021-06-20T01:44:08.993' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'test', N'round-robin', 15, N'prepare', CAST(N'2022-05-14T15:02:19.563' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'test1', N'knockout', 15, N'ended', CAST(N'2021-06-17T16:06:11.210' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'u6jdNNdfD4', N'knockout', 3, N'ended', CAST(N'2021-06-15T12:34:03.823' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'決賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T15:33:53.647' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'挑戰賽', N'knockout', 15, N'ended', CAST(N'2021-06-24T15:38:25.697' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第一組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:20:36.163' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第七組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:21:27.220' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第二組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:20:58.280' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第八組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:21:31.567' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第三組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:21:05.833' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第五組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:21:18.367' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第六組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:21:22.850' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第四組預賽', N'round-robin', 15, N'ended', CAST(N'2021-06-24T11:21:13.803' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'第四組預賽加賽', N'knockout', 10, N'ended', CAST(N'2021-06-24T15:29:20.107' AS DateTime), 8)
INSERT [dbo].[Competition] ([id], [type], [time_limit], [status], [create_time], [board_size]) VALUES (N'練習賽', N'knockout', 15, N'ended', CAST(N'2021-06-17T15:16:03.520' AS DateTime), 8)
GO
ALTER TABLE [dbo].[Competition] ADD  CONSTRAINT [DF_AutoDateTime]  DEFAULT (getdate()) FOR [create_time]
GO
